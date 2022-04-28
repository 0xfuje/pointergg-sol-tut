import { useState, useEffect } from "react";
import PrimaryButton from "../components/primary-button";
import abi from "../utils/Keyboards.json"
import { ethers } from "ethers";

export default function Home() {

  const [ethereum, setEthereum] = useState(undefined);
  const [connectedAccount, setConnectedAccount] = useState(undefined);
  const [keyboards, setKeyboards] = useState([]);
  const [newKeyboard, setNewKeyboard] = useState("");

  const CONTRACT_ADDRESS = '0xaeFa9e98e85df2143854FC622B485F03122aC9a1';
  const CONTRACT_ABI = abi.abi;

  const handleAccounts = (accounts) => {
    if (accounts.length > 0) {
      const account = accounts[0];
      console.log(`We have an account: ${account}`);
      setConnectedAccount(account);
    } else {
      console.log("No authorized accounts yet")
    }
  };

  const getConnectedAccount = async () => {
    if (window.ethereum) setEthereum(window.ethereum)
    if (ethereum) {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      handleAccounts(accounts)
    }
  };

  const getKeyboards = async () => {
    if (ethereum && connectedAccount) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const keyboardsContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const keyboards = await keyboardsContract.getKeyboards();
      console.log(`Retrieved keyboards... ${keyboards}`)
      setKeyboards(keyboards)
    }
  }

  useEffect(() => getConnectedAccount(), [])
  useEffect(() => getKeyboards(), [connectedAccount])
    
  const connectAccount = async () => {
    if (!ethereum) return alert(`Metamask is required to connect an account`);
    const accounts = await ethereum.request({  method: 'eth_requestAccounts' });
    handleAccounts(accounts);
  }

  const submitCreate = async (e) => {
    e.preventDefault();

    if (!ethereum) {return console.error(`Ethereum object is requried to create a keyboard!`); }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const keyboardsContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const createTxn = await keyboardsContract.create(newKeyboard);
    console.log(`Create transaction started... ${createTxn.hash}`)

    await createTxn.wait()
    console.log(`Created keyboard! ${createTxn.hash}`)

    await getKeyboards();
  }




  if (!ethereum) return <p>Please install Metamask to connect to this site</p>
  if (!connectedAccount) return <PrimaryButton onClick={connectAccount}>Connect with Metamask</PrimaryButton>
  return (
  <div className="flex flex-col gap-y-8">
    <form className="flex flex-col gap-y-2">
      <div>
        <label htmlFor="keyboard-description" className="block text-sm font-medium text-gray-700">
          Keyboard Description
        </label>
      </div>
      <input
        name="keyboard-type"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        value={newKeyboard}
        onChange={(e) => { setNewKeyboard(e.target.value) }}
      />
      <PrimaryButton type="submit" onClick={submitCreate}>
        Create Keyboard!
      </PrimaryButton>
    </form>
    <div className="">{keyboards}</div>
  </div>
  )

}