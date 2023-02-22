// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract Example {

    uint256 public balance;
    address public adr;
    string public text;
    
    uint256[] public data;
    
    mapping(address => uint256) public balances;

    function setValues(uint256 _balance, string memory _text)public returns(uint256) {
        balance = _balance;
        data.push(_balance);
        balances[msg.sender] += _balance;
        text = _text;
        return balance * 2;
    }

    function setAddress(address _adr) public payable {
        adr = _adr;
    }

    function getAddress() public view returns(address) {
        return adr;
    }

    function addition(int256 x, int256 y) public pure returns(int256) {
        return x + y;
    }
}

interface IExample {

    function balance() external view returns(uint256);

    function adr() external view returns(address);

    function text() external view returns(string memory);

    function data(uint256) external view returns(uint256);

    function balances(address) external view returns(uint256);

    function setValues(uint256, string memory _text) external returns(uint256);

    function setAddress(address) external payable;

    function getAddress() external view returns(address);

    function addition(int256, int256) external pure returns(int256);
}

contract Caller {

    IExample example;
    
    constructor(address adrExample) {
        example = IExample(adrExample);
    }

    function callBalance() public view returns(uint256) {
        bytes memory payload = abi.encodeWithSignature("balance()");
        (bool success, bytes memory returnData) = address(example).staticcall(payload);
        require(success);
        return abi.decode(returnData, (uint256));
    }

    function callAdr() public view returns(address){
        bytes memory payload = abi.encodeWithSignature("adr()");
        (bool success, bytes memory returnData) = address(example).staticcall(payload);
        require(success);
        return abi.decode(returnData, (address));
    }

    function callText() public view returns(string memory){
        bytes memory payload = abi.encodeWithSignature("text()");
        (bool success, bytes memory returnData) = address(example).staticcall(payload);
        require(success);
        return abi.decode(returnData, (string));
    }

    function callData(uint256 index) public view returns(uint256){
        bytes memory payload = abi.encodeWithSignature("data(uint256)", index);
        (bool success, bytes memory returnData) = address(example).staticcall(payload);
        require(success);
        return abi.decode(returnData, (uint256));
    }

    function callBalances(address _adr) public view returns(uint256){
        bytes memory payload = abi.encodeWithSignature("balances(address)", _adr);
        (bool success, bytes memory returnData) = address(example).staticcall(payload);
        require(success);
        return abi.decode(returnData, (uint256));
    }

    function callSetValues(uint256 _balance, string memory _text) public payable returns(uint256){
        bytes memory payload = abi.encodeWithSignature("setValues(uint256,string)", _balance, _text);
        (bool success, bytes memory returnData) = address(example).call(payload);
        require(success);
        return abi.decode(returnData, (uint256));
    }

    function callSetAddress(address _adr) public payable{
        bytes memory payload = abi.encodeWithSignature("setAddress(address)", _adr);
        (bool success, ) = address(example).call(payload);
        require(success);
    }

    function callGetAddress() public view returns(address){
        bytes memory payload = abi.encodeWithSignature("getAddress()");
        (bool success, bytes memory returnData) = address(example).staticcall(payload);
        require(success);
        return abi.decode(returnData, (address));
    }

    function callAddition(int256 _x, int256 _y) public returns(int256){
        bytes memory payload = abi.encodeWithSignature("addition(int256,int256)", _x, _y);
        (bool success, bytes memory returnData) = address(example).call(payload);
        require(success);
        return abi.decode(returnData, (int256));
    }
}
