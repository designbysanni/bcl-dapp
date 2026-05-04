// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CycleStaking
 * @notice Fixed 12% APY staking contract for $CYCLE token on Sepolia testnet.
 *         Rewards accrue per-second and are sourced from a pre-funded reward pool.
 */
contract CycleStaking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable cycleToken;

    // 12% APY — numerator/denominator for per-second calculation
    // rewardPerSecond = stakedAmount * 12 / (100 * 365 days)
    uint256 public constant APY_NUMERATOR = 12;
    uint256 public constant APY_DENOMINATOR = 100;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    struct StakeInfo {
        uint256 amount;          // staked principal
        uint256 rewardDebt;      // rewards already claimed
        uint256 lastUpdateTime;  // timestamp of last stake/claim/unstake
    }

    mapping(address => StakeInfo) public stakers;

    uint256 public totalStaked;
    uint256 public rewardPool; // CYCLE tokens deposited by owner for rewards

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 rewards);
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event RewardPoolWithdrawn(address indexed owner, uint256 amount);

    constructor(address _cycleToken, address initialOwner) Ownable(initialOwner) {
        require(_cycleToken != address(0), "Zero address");
        cycleToken = IERC20(_cycleToken);
    }

    // ─────────────────────────────────────────────────
    //  User Actions
    // ─────────────────────────────────────────────────

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake zero");

        StakeInfo storage info = stakers[msg.sender];

        // Settle any existing pending rewards before updating stake
        if (info.amount > 0) {
            uint256 pending = _calculatePending(info);
            info.rewardDebt += pending;
        }

        cycleToken.safeTransferFrom(msg.sender, address(this), amount);

        info.amount += amount;
        info.lastUpdateTime = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        StakeInfo storage info = stakers[msg.sender];
        require(amount > 0, "Cannot unstake zero");
        require(info.amount >= amount, "Insufficient staked balance");

        uint256 pending = _calculatePending(info) + info.rewardDebt;

        info.amount -= amount;
        info.lastUpdateTime = block.timestamp;
        info.rewardDebt = 0;
        totalStaked -= amount;

        // Return principal
        cycleToken.safeTransfer(msg.sender, amount);

        // Auto-claim accumulated rewards
        if (pending > 0) {
            require(rewardPool >= pending, "Insufficient reward pool");
            rewardPool -= pending;
            cycleToken.safeTransfer(msg.sender, pending);
        }

        emit Unstaked(msg.sender, amount, pending);
    }

    function claimRewards() external nonReentrant {
        StakeInfo storage info = stakers[msg.sender];

        uint256 pending = _calculatePending(info) + info.rewardDebt;
        require(pending > 0, "No rewards to claim");
        require(rewardPool >= pending, "Insufficient reward pool");

        info.rewardDebt = 0;
        info.lastUpdateTime = block.timestamp;
        rewardPool -= pending;

        cycleToken.safeTransfer(msg.sender, pending);

        emit RewardsClaimed(msg.sender, pending);
    }

    // ─────────────────────────────────────────────────
    //  Owner Actions
    // ─────────────────────────────────────────────────

    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Zero amount");
        cycleToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(msg.sender, amount);
    }

    function withdrawRewardPool(uint256 amount) external onlyOwner {
        require(amount <= rewardPool, "Exceeds pool balance");
        rewardPool -= amount;
        cycleToken.safeTransfer(msg.sender, amount);
        emit RewardPoolWithdrawn(msg.sender, amount);
    }

    // ─────────────────────────────────────────────────
    //  View Functions
    // ─────────────────────────────────────────────────

    function pendingRewards(address user) external view returns (uint256) {
        StakeInfo storage info = stakers[user];
        return _calculatePending(info) + info.rewardDebt;
    }

    function stakedBalance(address user) external view returns (uint256) {
        return stakers[user].amount;
    }

    // ─────────────────────────────────────────────────
    //  Internal
    // ─────────────────────────────────────────────────

    function _calculatePending(StakeInfo storage info) internal view returns (uint256) {
        if (info.amount == 0 || info.lastUpdateTime == 0) return 0;
        uint256 elapsed = block.timestamp - info.lastUpdateTime;
        // rewards = principal * 12% * elapsed / SECONDS_PER_YEAR
        return (info.amount * APY_NUMERATOR * elapsed) / (APY_DENOMINATOR * SECONDS_PER_YEAR);
    }
}
