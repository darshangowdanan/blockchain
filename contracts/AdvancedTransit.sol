// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AdvancedTransit {
    
    struct Ticket {
        uint256 ticketId;
        address owner;
        
        // Time Logic
        uint256 activationTime; // Set when first scanned
        bool isActive;          // True after first scan
        
        // Path Logic
        string[] allowedPath;   // e.g., ["Majestic", "Corporation", "Shivajinagar"]
        string[] scannedStops;  // e.g., ["Majestic"] - Prevents reuse at same stop
    }

    uint256 public nextTicketId;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets; 

    event TicketTransfer(uint256 ticketId, address from, address to);
    event TicketScanned(uint256 ticketId, string stopName, uint256 timestamp);

    // 1. Buy Ticket (With Path)
    function buyTicket(string[] memory _path) public payable {
        tickets[nextTicketId] = Ticket({
            ticketId: nextTicketId,
            owner: msg.sender,
            activationTime: 0,
            isActive: false,
            allowedPath: _path,
            scannedStops: new string[](0) 
        });
        
        userTickets[msg.sender].push(nextTicketId);
        nextTicketId++;
    }

    // 2. Conductor Scans Ticket
    function scanTicket(uint256 _ticketId, string memory _currentStop) public {
        Ticket storage t = tickets[_ticketId];

        // Basic Checks
        require(msg.sender != t.owner, "Cannot scan own ticket"); 
        
        // Time Check (4 Hours from First Scan)
        if (t.isActive) {
            require(block.timestamp < t.activationTime + 4 hours, "Ticket Expired (Time Limit)");
        } else {
            // First time scanning! Start the timer.
            t.isActive = true;
            t.activationTime = block.timestamp;
        }

        // Path Check: Is this stop in the allowed path?
        bool isAllowed = false;
        for (uint i = 0; i < t.allowedPath.length; i++) {
            if (keccak256(bytes(t.allowedPath[i])) == keccak256(bytes(_currentStop))) {
                isAllowed = true;
                break;
            }
        }
        require(isAllowed, "Invalid Stop: Ticket not valid for this location");

        // Reuse Check: Have we already scanned at this stop?
        for (uint i = 0; i < t.scannedStops.length; i++) {
            require(
                keccak256(bytes(t.scannedStops[i])) != keccak256(bytes(_currentStop)), 
                "Ticket already used at this stop"
            );
        }

        // Success: Record the scan
        t.scannedStops.push(_currentStop);
        emit TicketScanned(_ticketId, _currentStop, block.timestamp);
    }

    // 3. Validation View (Frontend Helper)
    function getMyValidTickets(address _user) public view returns (Ticket[] memory) {
        uint256[] memory ids = userTickets[_user];
        uint256 count = 0;

        // First pass: Count valid tickets
        for (uint256 i = 0; i < ids.length; i++) {
            Ticket memory t = tickets[ids[i]];
            bool expired = t.isActive && (block.timestamp > t.activationTime + 4 hours);
            if (t.owner == _user && !expired) {
                count++;
            }
        }

        // Second pass: Fill array
        Ticket[] memory active = new Ticket[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            Ticket memory t = tickets[ids[i]];
            bool expired = t.isActive && (block.timestamp > t.activationTime + 4 hours);
            if (t.owner == _user && !expired) {
                active[index] = t;
                index++;
            }
        }
        return active;
    }
}