// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdvancedTransit {
    
    struct Ticket {
        uint256 ticketId;
        string userId;          // Stores "user@gmail.com"
        uint256 activationTime; 
        bool isActive;          
        string[] allowedPath;   
        string[] scannedStops;  
    }

    uint256 public nextTicketId;
    address public admin; // The server's wallet address

    mapping(uint256 => Ticket) public tickets;

    event TicketIssued(uint256 ticketId, string userId);
    event TicketScanned(uint256 ticketId, string stopName, uint256 timestamp);

    constructor() {
        admin = msg.sender; // The deployer (YOU) is the admin
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin Server can perform this");
        _;
    }

    // 1. Issue Ticket (Called by YOUR SERVER)
    function issueTicket(string memory _userId, string[] memory _path) public onlyAdmin {
        tickets[nextTicketId] = Ticket({
            ticketId: nextTicketId,
            userId: _userId,
            activationTime: 0,
            isActive: false,
            allowedPath: _path,
            scannedStops: new string[](0) 
        });
        
        emit TicketIssued(nextTicketId, _userId);
        nextTicketId++;
    }

    // 2. Scan Ticket (Called by Conductor)
    function scanTicket(uint256 _ticketId, string memory _currentStop) public {
        Ticket storage t = tickets[_ticketId];

        // Basic Checks
        if (t.isActive) {
            require(block.timestamp < t.activationTime + 4 hours, "Ticket Expired");
        } else {
            t.isActive = true;
            t.activationTime = block.timestamp;
        }

        // Path Check
        bool isAllowed = false;
        for (uint i = 0; i < t.allowedPath.length; i++) {
            if (keccak256(bytes(t.allowedPath[i])) == keccak256(bytes(_currentStop))) {
                isAllowed = true;
                break;
            }
        }
        require(isAllowed, "Invalid Stop");

        // Reuse Check
        for (uint i = 0; i < t.scannedStops.length; i++) {
            require(
                keccak256(bytes(t.scannedStops[i])) != keccak256(bytes(_currentStop)), 
                "Already used here"
            );
        }

        t.scannedStops.push(_currentStop);
        emit TicketScanned(_ticketId, _currentStop, block.timestamp);
    }
    
    function getTicketDetails(uint256 _ticketId) public view returns (Ticket memory) {
        return tickets[_ticketId];
    }
}