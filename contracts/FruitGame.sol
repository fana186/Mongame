// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MONToken.sol";

/**
 * @title FruitGame
 * @dev Main contract for the Fruit Match Game on Monad network
 */
contract FruitGame is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Reference to game token
    MONToken public gameToken;
    
    // Structs
    struct Objective {
        uint8 fruitType; // Type of fruit to collect
        uint16 count;    // Number of fruits to collect
    }
    
    struct Level {
        uint16 levelId;
        uint32 targetScore;
        uint16 moveLimit;
        uint8 boardWidth;
        uint8 boardHeight;
        uint8 fruitTypes;
        uint8 specialItemProbability; // Percentage (0-100)
        Objective[] objectives;
        bool active;
    }
    
    struct PlayerProgress {
        uint16 highestUnlockedLevel;
        mapping(uint16 => uint32) highScores;
        mapping(uint16 => uint8) starsEarned;
        uint256 totalScore;
        uint16 levelsCompleted;
    }
    
    // State variables
    mapping(uint16 => Level) public levels;
    mapping(address => PlayerProgress) public playerProgress;
    uint16 public totalLevels;
    uint256 public totalPlayers;
    
    // Events
    event LevelCompleted(address indexed player, uint16 levelId, uint32 score, uint8 stars);
    event LevelUnlocked(address indexed player, uint16 levelId);
    event RewardsEarned(address indexed player, uint16 levelId, uint256 amount);
    event LevelAdded(uint16 levelId);
    
    // Constructor
    constructor(address _tokenAddress) {
        gameToken = MONToken(_tokenAddress);
        totalLevels = 0;
        totalPlayers = 0;
    }
    
    /**
     * @dev Add a new level to the game
     */
    function addLevel(
        uint16 _levelId,
        uint32 _targetScore,
        uint16 _moveLimit,
        uint8 _boardWidth,
        uint8 _boardHeight,
        uint8 _fruitTypes,
        uint8 _specialItemProbability,
        Objective[] memory _objectives
    ) external onlyOwner {
        require(_levelId > 0, "Level ID must be positive");
        require(!levels[_levelId].active, "Level already exists");
        require(_boardWidth > 0 && _boardHeight > 0, "Board dimensions must be positive");
        require(_fruitTypes > 0 && _fruitTypes <= 9, "Invalid number of fruit types");
        require(_specialItemProbability <= 100, "Probability must be 0-100");
        
        Level storage newLevel = levels[_levelId];
        newLevel.levelId = _levelId;
        newLevel.targetScore = _targetScore;
        newLevel.moveLimit = _moveLimit;
        newLevel.boardWidth = _boardWidth;
        newLevel.boardHeight = _boardHeight;
        newLevel.fruitTypes = _fruitTypes;
        newLevel.specialItemProbability = _specialItemProbability;
        newLevel.active = true;
        
        // Add objectives
        for (uint i = 0; i < _objectives.length; i++) {
            newLevel.objectives.push(_objectives[i]);
        }
        
        // Update total levels if this is a new max level
        if (_levelId > totalLevels) {
            totalLevels = _levelId;
        }
        
        emit LevelAdded(_levelId);
    }
    
    /**
     * @dev Get level information
     */
    function getLevel(uint16 _levelId) external view returns (
        uint16 levelId,
        uint32 targetScore,
        uint16 moveLimit,
        uint8 boardWidth,
        uint8 boardHeight,
        uint8 fruitTypes,
        uint8 specialItemProbability,
        bool active
    ) {
        Level storage level = levels[_levelId];
        require(level.active, "Level does not exist");
        
        return (
            level.levelId,
            level.targetScore,
            level.moveLimit,
            level.boardWidth,
            level.boardHeight,
            level.fruitTypes,
            level.specialItemProbability,
            level.active
        );
    }
    
    /**
     * @dev Get level objectives
     */
    function getLevelObjectives(uint16 _levelId) external view returns (Objective[] memory) {
        Level storage level = levels[_levelId];
        require(level.active, "Level does not exist");
        
        return level.objectives;
    }
    
    /**
     * @dev Check if a player has a specific level unlocked
     */
    function isLevelUnlocked(address _player, uint16 _levelId) public view returns (bool) {
        if (_levelId == 1) return true; // Level 1 is always unlocked
        
        PlayerProgress storage progress = playerProgress[_player];
        return _levelId <= progress.highestUnlockedLevel;
    }
    
    /**
     * @dev Complete a level and record player's score
     */
    function completeLevel(
        uint16 _levelId, 
        uint32 _score, 
        uint8 _stars,
        bool _objectivesCompleted
    ) external nonReentrant {
        require(_levelId > 0 && _levelId <= totalLevels, "Invalid level ID");
        require(levels[_levelId].active, "Level does not exist");
        require(isLevelUnlocked(msg.sender, _levelId), "Level not unlocked");
        require(_stars <= 3, "Stars must be 0-3");
        
        Level storage level = levels[_levelId];
        PlayerProgress storage progress = playerProgress[msg.sender];
        
        // Initialize player if this is their first completed level
        if (progress.highestUnlockedLevel == 0) {
            progress.highestUnlockedLevel = 1;
            totalPlayers += 1;
        }
        
        // Update high score if better
        bool isNewHighScore = false;
        if (_score > progress.highScores[_levelId]) {
            progress.highScores[_levelId] = _score;
            isNewHighScore = true;
        }
        
        // Update stars if better
        if (_stars > progress.starsEarned[_levelId]) {
            progress.starsEarned[_levelId] = _stars;
        }
        
        // Check if level was actually passed
        bool levelPassed = _score >= level.targetScore && _objectivesCompleted;
        
        // Update total score
        if (isNewHighScore) {
            progress.totalScore += _score - progress.highScores[_levelId];
        }
        
        // If level is passed and it's the highest level, unlock next level
        if (levelPassed && _levelId == progress.highestUnlockedLevel && _levelId < totalLevels) {
            progress.highestUnlockedLevel += 1;
            emit LevelUnlocked(msg.sender, progress.highestUnlockedLevel);
            progress.levelsCompleted += 1;
        }
        
        // Calculate and award tokens
        if (levelPassed) {
            uint256 baseReward = _calculateBaseReward(_levelId);
            uint256 starBonus = baseReward * _stars / 3;
            uint256 totalReward = baseReward + starBonus;
            
            // Mint tokens to player
            gameToken.mint(msg.sender, totalReward);
            emit RewardsEarned(msg.sender, _levelId, totalReward);
        }
        
        emit LevelCompleted(msg.sender, _levelId, _score, _stars);
    }
    
    /**
     * @dev Calculate base reward for completing a level
     */
    function _calculateBaseReward(uint16 _levelId) internal pure returns (uint256) {
        // Base formula for rewards - can be adjusted
        return _levelId * 10 * 10**18; // 10 tokens per level, with 18 decimals
    }
    
    /**
     * @dev Get player's high score for a level
     */
    function getPlayerHighScore(address _player, uint16 _levelId) external view returns (uint32) {
        return playerProgress[_player].highScores[_levelId];
    }
    
    /**
     * @dev Get player's stars earned for a level
     */
    function getPlayerStars(address _player, uint16 _levelId) external view returns (uint8) {
        return playerProgress[_player].starsEarned[_levelId];
    }
    
    /**
     * @dev Get player's highest unlocked level
     */
    function getPlayerHighestLevel(address _player) external view returns (uint16) {
        return playerProgress[_player].highestUnlockedLevel;
    }
    
    /**
     * @dev Get player's total score across all levels
     */
    function getPlayerTotalScore(address _player) external view returns (uint256) {
        return playerProgress[_player].totalScore;
    }
    
    /**
     * @dev Admin function to unlock a level for a player (for testing)
     */
    function unlockLevelForPlayer(address _player, uint16 _levelId) external onlyOwner {
        require(_levelId > 0 && _levelId <= totalLevels, "Invalid level ID");
        
        PlayerProgress storage progress = playerProgress[_player];
        
        // Initialize player if needed
        if (progress.highestUnlockedLevel == 0) {
            progress.highestUnlockedLevel = 1;
            totalPlayers += 1;
        }
        
        if (_levelId > progress.highestUnlockedLevel) {
            progress.highestUnlockedLevel = _levelId;
            emit LevelUnlocked(_player, _levelId);
        }
    }
}