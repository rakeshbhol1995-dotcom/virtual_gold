// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LaunchpadToken
 * @dev Simple ERC20 deployed by TokenFactory for each launchpad project.
 *      Minting is restricted to the paired LaunchpadCurve contract.
 *      Burning is restricted to the paired LaunchpadCurve contract.
 */
contract LaunchpadToken is ERC20, Ownable {
    address public curve; // The paired bonding curve

    string public description;
    string public imageUrl;
    uint256 public createdAt;

    event CurveSet(address indexed curve);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        string memory _imageUrl,
        address _creator
    ) ERC20(_name, _symbol) Ownable(_creator) {
        description = _description;
        imageUrl    = _imageUrl;
        createdAt   = block.timestamp;
    }

    modifier onlyCurve() {
        require(msg.sender == curve, "Only paired curve");
        _;
    }

    function setCurve(address _curve) external onlyOwner {
        require(curve == address(0), "Curve already set");
        curve = _curve;
        emit CurveSet(_curve);
    }

    function mint(address to, uint256 amount) external onlyCurve {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyCurve {
        _burn(from, amount);
    }
}
