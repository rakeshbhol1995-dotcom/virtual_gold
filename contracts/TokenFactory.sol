// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LaunchpadToken.sol";
import "./LaunchpadCurve.sol";

/**
 * @title TokenFactory (Slim)
 * @dev Gold Chain Launchpad Factory - pump.fun style on Base.
 *      Stripped of heavy view functions to stay under 24kb limit.
 *      Use LaunchpadCurve directly for curve data reads.
 */
contract TokenFactory is Ownable, ReentrancyGuard {
    address public collateralToken;
    address public feeRecipient;
    uint256 public launchFeeNative = 0.01 ether;
    uint256 public totalLaunched;

    bool    public migrationPending;
    address public l1ChainBridge;
    uint256 public migrationAt;

    struct TokenInfo {
        address token;
        address curve;
        address creator;
        uint256 createdAt;
    }

    TokenInfo[] public tokens;
    mapping(address => address) public tokenToCurve;

    event TokenLaunched(address indexed creator, address token, address curve, string name, string symbol);
    event MigrationAnnounced(address bridge, uint256 at);

    constructor(address _collateral, address _fee) Ownable(msg.sender) {
        collateralToken = _collateral;
        feeRecipient    = _fee;
    }

    function launchToken(
        string calldata name,
        string calldata symbol,
        string calldata description,
        string calldata imageUrl
    ) external payable nonReentrant returns (address tokenAddr, address curveAddr) {
        require(msg.value >= launchFeeNative, "Insufficient launch fee");
        require(!migrationPending, "Migration in progress");
        require(bytes(name).length > 0 && bytes(symbol).length > 0, "Required");

        LaunchpadToken t = new LaunchpadToken(name, symbol, description, imageUrl, msg.sender);
        LaunchpadCurve c = new LaunchpadCurve(address(t), collateralToken, feeRecipient, address(this));

        t.setCurve(address(c));
        t.transferOwnership(msg.sender);

        tokenAddr = address(t);
        curveAddr = address(c);

        tokens.push(TokenInfo({ token: tokenAddr, curve: curveAddr, creator: msg.sender, createdAt: block.timestamp }));
        tokenToCurve[tokenAddr] = curveAddr;
        totalLaunched += 1;

        (bool ok, ) = feeRecipient.call{value: msg.value}("");
        require(ok, "Fee send failed");

        emit TokenLaunched(msg.sender, tokenAddr, curveAddr, name, symbol);
    }

    function getToken(uint256 i) external view returns (TokenInfo memory) {
        return tokens[i];
    }

    function getAll() external view returns (TokenInfo[] memory) {
        return tokens;
    }

    function setLaunchFee(uint256 fee) external onlyOwner { launchFeeNative = fee; }
    function setFeeRecipient(address f) external onlyOwner { feeRecipient = f; }

    function announceMigration(address bridge) external onlyOwner {
        migrationPending = true;
        l1ChainBridge    = bridge;
        migrationAt      = block.timestamp + 7 days;
        emit MigrationAnnounced(bridge, migrationAt);
    }

    function cancelMigration() external onlyOwner {
        migrationPending = false;
        l1ChainBridge    = address(0);
        migrationAt      = 0;
    }

    receive() external payable {}
}
