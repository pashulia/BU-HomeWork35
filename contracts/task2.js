const Web3 = require('web3')
const fs = require('fs');
const solc = require('solc');
const readline = require('readline-sync')
let web3 = new Web3('http://127.0.0.1:7545')
let fName = "task_25_1.sol";
let cName = "Example";


function myCompiler(solc, fileName, contractNames, contractCode) {
    // настраиваем структуру input для компилятора
    let input = {
        language: 'Solidity',
        sources: {
            [fileName]: {
                content: contractCode
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // console.log("Compilation result: ", output);
    // console.log("Compilation result: ", output.contracts);

    let ABI = output.contracts[fName].Example.abi;
    let bytecode = output.contracts[fName].Example.evm.bytecode.object;
    let ABI2 = output.contracts[fName].Caller.abi;
    let bytecode2 = output.contracts[fName].Caller.evm.bytecode.object;

    fs.writeFileSync(__dirname + '/' + contractNames + '.abi', JSON.stringify(ABI));
    fs.writeFileSync(__dirname + '/' + contractNames + '.bin', bytecode);
    fs.writeFileSync(__dirname + '/' + 'Caller' + '.abi', JSON.stringify(ABI2));
    fs.writeFileSync(__dirname + '/' + 'Caller' + '.bin', bytecode2);
}

// если хотите автоматически, то попробуйте 
// const abi = await web3.eth.getAbi(address);

async function main() {

    // считываем код контракта из файла
    let cCode = fs.readFileSync(__dirname + "/" + fName, "utf-8")
    
    try {
        myCompiler(solc, fName, cName, cCode)
    } catch (err) {
        console.log(err);

        let compileVers = 'v0.8.15+commit.e14f2714'
        solc.loadRemoteVersion(compileVers, (err, solcSnapshot) => {
            if (err) {
                console.log(err);
            } else {
                myCompiler(solcSnapshot, fName, cName, cCode)
            }
        })
    }

    console.log("   --- Создание аккаунта ---   ");

    let key = "0x2da9ed0c129654508bed32c57c6d106b4b76144323f95fa3dcd33ec2816eb7f8"
    let account = web3.eth.accounts.privateKeyToAccount(key)
    
    // считываение уже развернутого контракта по указаному пути
    const ABI = JSON.parse(fs.readFileSync(__dirname + '/' + 'Caller.abi', 'utf-8'))
    const bytecode = fs.readFileSync(__dirname + '/' + 'Caller.bin', 'utf-8')
    const ABI2 = JSON.parse(fs.readFileSync(__dirname + '/' + 'Example.abi', 'utf-8'))
    const bytecode2 = fs.readFileSync(__dirname + '/' + 'Example.bin', 'utf-8')

    // Создает новый экземпляр контракта и связывает его с уже развёрнутым в сети контрактом
    let myContract = new web3.eth.Contract(ABI)
    let myContract2 = new web3.eth.Contract(ABI2)
    
    // console.log(myContract2);
    
    let balance  = readline.question("enter balance: ");
    let adr  = readline.question("enter address: ");
    let text  = readline.question("enter text: ");

    // Деплой контракта Example
    await myContract2.deploy({
        data: bytecode2, 
        arguments: [balance, adr, text]
    })
    .send({
        from: account.address,
        gas: 5000000 
    })
    // .on('receipt', (receipt) => {
    //     console.log(receipt);
    // })
    .then(function(newContractInstance) {
            myContract2 = newContractInstance
        }
    )
    
    // console.log(myContract2._address);

    // Деплой контракта Caller
    await myContract.deploy({
        data: bytecode, 
        arguments: [myContract2._address]
    })
    .send({
        from: account.address,
        gas: 5_000_000 
    })
    // .on('receipt', (receipt) => {
    //     console.log(receipt);
    // })
    .then(function(newContractInstance) {
            myContract = newContractInstance
        }
    )
    // вывод методов
    console.log("methods: ", myContract.methods);

    // выбор метода
    while (true) {
        let choose = readline.question(`
        Choose method:
        1. callAddition(int256, int256)
        2. callAdr()
        3. callBalance()
        4. callBalances(address)
        5. callData(uint256)
        6. callGetAddress()
        7. callSetAddress(address)
        8. callSetValues(uint256, string)
        9. callText()
        10. exit
        `)
        if (choose == 1) {
            let adr  = readline.question("enter _x: ");
            let num  = readline.question("enter _y: ");
            await myContract.methods.callAddition(adr, [num, _str])
            .call()
            // .send({ from: account.address })
            // .on('receipt', (receipt) => {
            //     console.log(receipt);
            // })
            .then(console.log)
        } else if (choose == 2) {
            await myContract.methods.callAdr()
            .call() 
            .then(console.log)
        } else if (choose == 3) {
            await myContract.methods.callBalance()
            .call()
            .then(console.log)       
        } else if (choose == 4) {
            let _adr  = readline.question("enter address: ");
            await myContract.methods.callBalances(_adr)
            .send({ from: account.address })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log) 
        } else if (choose == 5) {
            let index  = readline.question("enter index: ");
            await myContract.methods.callData(index)
            .call()
            // этот метод не работает, но должен вроде как
            // .send({ from: account.address })
            // .on('receipt', (receipt) => {
            //     console.log(receipt);
            // })
            .then(console.log)       
        } else if (choose == 6) {
            await myContract.methods.callGetAddress().call().then(console.log)
        } else if (choose == 7) {
            let _adr  = readline.question("enter address: ");
            await myContract.methods.callSetAddress(_adr).call().then(console.log)
        } else if (choose == 8) {
            let _balance  = readline.question("enter balance: ");
            let _text  = readline.question("enter _text: ");
            await myContract.methods.callSetValues(_balance, _text).call().then(console.log)
        } else if (choose == 9) {
            await myContract.methods.callText().call().then(console.log)
        } else if (choose == 10) {
            break
        }
    }
}

main()

.then(() => process.exit(0))

.catch((error) => {
    console.error(error);
    process.exit(1);
})

