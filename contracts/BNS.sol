// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract BNS {
    struct User {
        bool isRegistered;
        string username;
    }

    mapping(address => User) private users;
    mapping(string => address) private userNaming;

    function register(string memory _username) public {
        require(
            userNaming[_username] ==
                address(0x0000000000000000000000000000000000000000),
            "already registered"
        );
        // require the username not to be an empty string
        require(
            keccak256(bytes(_username)) != keccak256(bytes("")),
            "Check the username"
        );

        userNaming[_username] = msg.sender;

        users[msg.sender].isRegistered = true;
        users[msg.sender].username = _username;
    }

    function transferETH(string memory _username) public payable {
        require(
            userNaming[_username] !=
                address(0x0000000000000000000000000000000000000000),
            "not registered"
        );
        require(msg.sender != userNaming[_username], "Check the recipient");

        (bool success, ) = userNaming[_username].call{value: msg.value}("");
        require(success);
    }

    function isUserRegistered() public view returns (bool) {
        return users[msg.sender].isRegistered;
    }

    function getUsername() public view returns (string memory) {
        return users[msg.sender].username;
    }
}
