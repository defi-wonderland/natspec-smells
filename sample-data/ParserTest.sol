// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

// forgefmt: disable-start
// This file is used for testing the parser

interface IParserTest {
  /// @notice Thrown whenever something goes wrong
  error SimpleError(uint256 _param1, uint256 _param2);

  /// @notice Emitted whenever something happens
  event SimpleEvent(uint256 _param1, uint256 _param2);

  /// @notice The enum description
  enum SimpleEnum {
    A,
    B,
    C
  }

  /// @notice View function with no parameters
  /// @dev Natspec for the return value is missing
  /// @return The returned value
  function viewFunctionNoParams() external view returns (uint256);

  /**
   * @notice A function with different style of natspec
   * @param _param1  The first parameter
   * @param _param2  The second parameter
   * @return The returned value
   */
   function viewFunctionWithParams(uint256 _param1, uint256 _param2) external view returns (uint256);


   // @notice Forgot one slash but it's sill natspec
   //// @dev Too many slashes are fine too
   /// @return Huh?
   function someVariable() external view returns (uint256);


  /// @notice A struct holding 2 variables of type uint256
  /// @member a  The first variable
  /// @member b  The second variable
  /// @dev This is definitely a struct
  struct SimplestStruct {
    uint256 a;
    uint256 b;
  }

  /// @notice Linter fail
    /// @return      _returned What's being returned
   function SOME_CONSTANT() external view returns (uint256 _returned);
}

/// @notice A contract with correct natspec
contract ParserTest is IParserTest {
  /// @inheritdoc IParserTest
  /// @dev Providing context
  uint256 public someVariable;

  /// @inheritdoc IParserTest
  uint256 public constant SOME_CONSTANT = 123;

  /// @notice The constructor
  /// @param _struct The struct parameter
  constructor(SimplestStruct memory _struct) {
    someVariable = _struct.a + _struct.b;
  }

  /// @notice The description of the modifier
  /// @param _param1 The only parameter
  modifier someModifier(bool _param1) {
    _;
  }

  // TODO: Fallback and receive functions
  // fallback() {}
  // receive () {}

  /// @inheritdoc IParserTest
  /// @dev Dev comment for the function
  function viewFunctionNoParams() external pure returns (uint256){
    return 1;
  }

  /// @inheritdoc IParserTest
  function viewFunctionWithParams(uint256 _param1, uint256 _param2) external pure returns (uint256) {
    return _param1 + _param2;
  }

  /// @notice Some private stuff
  /// @dev Dev comment for the private function
  /// @param _paramName The parameter name
  /// @return _returned The returned value
  function _viewPrivate(uint256 _paramName) private pure returns (uint256 _returned) {
    return 1;
  }

  /// @notice Some internal stuff
  /// @dev Dev comment for the internal function
  /// @param _paramName The parameter name
  /// @return _returned The returned value
  function _viewInternal(uint256 _paramName) internal pure returns (uint256 _returned) {
    return 1;
  }

  /// @notice Some internal stuff
  ///         Separate line
  ///         Third one
  function _viewMultiline() internal pure {
  }

  /// @notice Some internal stuff
  /// @notice Separate line
  function _viewDuplicateTag() internal pure {
  }
}

// This is a contract with invalid / missing natspec
contract ParserTestFunny is IParserTest {
  // no natspec, just a comment
  struct SimpleStruct {
    /// @notice The first variable
    uint256 a;
    /// @notice The first variable
    uint256 b;
  }

  modifier someModifier() {
    _;
  }

  /// @inheritdoc IParserTest
  /// @dev Providing context
  uint256 public someVariable;

  // @inheritdoc IParserTest
  uint256 public constant SOME_CONSTANT = 123;

  /// @inheritdoc IParserTest
  /// @dev Why does it have a comment here?
  function viewFunctionNoParams() external view returns (uint256){
    return 1;
  }

  // Forgot there is @inheritdoc and @notice
  function viewFunctionWithParams(uint256 _param1, uint256 _param2) external view returns (uint256) {
    return _param1 + _param2;
  }

  // @notice Some internal stuff
  function _viewInternal() internal view returns (uint256) {
    return 1;
  }

  /**
   *
   *
   * 
   * I met Obama once
   * She's cool
   */

  /// @notice Some private stuff
  /// @dev Dev comment for the private function
  /// @param      _paramName The parameter name
  /// @return     _returned The returned value
  function _viewPrivate(uint256 _paramName) private pure returns (uint256 _returned) {
    return 1;
  }

  /// @notice Some internal stuff
  /// @dev Dev comment for the internal function
  /// @param _paramName The parameter name
  /// @return _returned The returned value
  function _viewInternal(uint256 _paramName) internal pure returns (uint256 _returned) {
    return 1;
  }

  // Random comment
  /// @notice Some internal stuff
  ///         Separate line
  ///         Third one
  function _viewMultiline() internal pure {
  }

  /// @notice Some internal stuff
  /// @notice Separate line
  function _viewDuplicateTag() internal pure {

  }

   // @notice Forgot one slash but it's sill natspec
   //// @dev Too many slashes are fine too
   /// @return Huh?
   function _internalIncorrectSlashes() internal pure returns (uint256) {
    return 0;
   }

 /// @notice Linter fail
     /// @dev      Oh god please help us
   function _internalLinterFail() internal pure {}
}
// forgefmt: disable-end
