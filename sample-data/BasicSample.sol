// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

contract BasicSample {
  /**
  * @notice Empty string for revert checks
  * @dev result of doing keccak256(bytes(''))
  */
  bytes32 internal constant _EMPTY_STRING = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;

  /**
   * @notice External function that returns a bool
   * @dev A dev comment
   * @param  _magicNumber A parameter description
   * @param _name Another parameter description
   * @return _isMagic Some return data
   */
  function externalSimple(uint256 _magicNumber, string memory _name) external pure returns(bool _isMagic) {
    return true;
  }

  /**
   * @notice Private test function
   * @param _magicNumber A parameter description
   */
  function privateSimple(uint256 _magicNumber) private pure {}

  /**
   * @notice Private test function
   *         with multiple
   * lines
   */
  function multiline() external pure {}

  /**
   * @notice Private test function
   * @notice Another notice
   */
  function multitag() external pure {}

  /**
   * @notice External function that returns a bool
   * @dev A dev comment
   * @param _magicNumber A parameter description
   * @param _name Another parameter description
   * @return _isMagic Some return data
   * @return Test test
   */
  function externalSimpleMultipleReturn(uint256 _magicNumber, string memory _name) external pure returns(bool _isMagic, uint256) {
    return (true, 111);
  }
}
