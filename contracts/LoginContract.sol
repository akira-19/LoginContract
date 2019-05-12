pragma solidity ^0.5.2;

contract LoginContract {

   mapping (address => bytes32) password;
   mapping (address => address[]) friends;
   mapping (address => uint8[]) resetNumber;

   event loginInfo(address indexed user, uint time, bool logined);

   function register(string calldata _password, address fr1, address fr2, address fr3) external  {
       bytes32 pass = sha256(abi.encodePacked(_password));
       password[msg.sender] = pass;
       friends[msg.sender] = [fr1, fr2, fr3];
   }

   function login(string calldata _password) external  {
       bytes32 pass = sha256(abi.encodePacked(_password));
       require(pass == password[msg.sender]);
       if (pass == password[msg.sender]) {
           uint currentTime = block.timestamp;
           emit loginInfo(msg.sender, currentTime, true);
       }
   }

   function logout() external{
       uint currentTime = block.timestamp;
       emit loginInfo(msg.sender, currentTime, false);
   }

   function forgotPassword() external {
       uint8 passNum1 = uint8(uint256(keccak256(abi.encode(block.timestamp, friends[msg.sender][0])))%99 + 1);
       uint8 passNum2 = uint8(uint256(keccak256(abi.encode(block.timestamp, friends[msg.sender][1])))%99 + 1);
       uint8 passNum3 = uint8(uint256(keccak256(abi.encode(block.timestamp, friends[msg.sender][2])))%99 + 1);

       resetNumber[msg.sender] = [passNum1, passNum2, passNum3];
   }

   function changePassword(uint8 _passNum1, uint8 _passNum2, uint8 _passNum3, string calldata _password) external {
       bool zeroCheck = true;
       for (uint i = 0; i < 3; i++){
           if(resetNumber[msg.sender][i] == 0){
               zeroCheck = false;
           }
       }
       require(zeroCheck, "zerocheck");
       require(_passNum1 != 0);
       require(_passNum2 != 0);
       require(_passNum3 != 0);
       
       uint8 counter = 0;
       uint8 num1 = _passNum1;
       uint8 num2 = _passNum2;
       uint8 num3 = _passNum3;
       for (uint i = 0; i < 3; i++){
           if (resetNumber[msg.sender][i] == num1){
               counter++;
               num1 = 0;
           }else if (resetNumber[msg.sender][i] == num2){
               counter++;
               num2 = 0;
           }else if (resetNumber[msg.sender][i] == num3){
             counter++;
             num3 = 0;
           }
       }
       require(counter >= 2, "do not meet 2 of 3");
       bytes32 pass = sha256(abi.encodePacked(_password));
       password[msg.sender] = pass;
       resetNumber[msg.sender] = [0, 0, 0];
   }

   function showResetNumber(address forgetter) external view returns(uint8){
       require(
           friends[forgetter][0] == msg.sender ||
           friends[forgetter][1] == msg.sender ||
           friends[forgetter][2] == msg.sender
           );
       for (uint i = 0; i < 3; i++){
           if (msg.sender == friends[forgetter][i]){
               return resetNumber[forgetter][i];
           }
       }
   }



}
