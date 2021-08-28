import React, { Component } from "react";
import BNS from "./contracts/BNS.json";
import getWeb3 from "./getWeb3";
import 'semantic-ui-css/semantic.min.css';
import { Input, Divider, Button } from "semantic-ui-react";
import "./App.css";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    account: null,
    contract: null,
    registered: false,
    username: ''
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      let account = accounts[0];

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BNS.networks[networkId];
      const contract = new web3.eth.Contract(
        BNS.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, account, contract }, this.runExample);

      this.getAccount();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { account, contract } = this.state;

    await this.getAccount();

    let registered = await contract.methods.isUserRegistered()
      .call({ from: account });

    console.log("account =", account);
    console.log("contract =", contract);
    console.log("is User registered ? :", registered);

    this.setState({
      registered
    });
  };

  getAccount = async () => {
    if (this.state.web3 !== null || this.state.web3 !== undefined) {
      await window.ethereum.on('accountsChanged', async (accounts) => {
        let registered = false;
        if (this.state.contract !== null) {
          registered = await this.state.contract.methods.isUserRegistered()
            .call({ from: accounts[0] });
          this.setState({ registered });
        }

        this.setState({
          account: accounts[0]
        });
      });
    }
  }

  register = async () => {
    const { account, contract, username } = this.state;

    await contract.methods.register(username)
      .send({ from: account });

    let registered = await contract.methods.isUserRegistered()
      .call({ from: account });

    this.setState({
      registered
    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Welcome user!</h1>
        <h3>Let's send some ETH using the recipient username</h3>
        <br></br>
        <Divider />

        <div className="send-eth">
          {
            this.state.registered ?
              <div className="register">
                <h2>Send ETH to your friend</h2>
                <br></br>
                <Input
                  fluid
                  size='large'
                  placeholder='username'
                  onChange={e => this.setState({ username: e.target.value })}
                />
                <br></br>
                <Button
                  fluid
                  size='large'
                  color='teal'
                  content="Send"
                />
              </div>
              :
              <div className="register">
                <h2>Register to BNS</h2>
                <br></br>
                <Input
                  fluid
                  size='large'
                  placeholder='username'
                  onChange={e => this.setState({ username: e.target.value })}
                />
                <br></br>
                <Button
                  fluid
                  size='large'
                  color='vk'
                  content="Register"
                  onClick={this.register}
                />
              </div>
          }
        </div>



      </div>
    );
  }
}

export default App;
