const Web3 = require('web3')
const fs = require('fs');
const solc = require('solc');
const readline = require('readline-sync')
let web3 = new Web3('http://127.0.0.1:7545')
let fName = "task_17.sol";
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

    console.log("Compilation result: ", output);
    // console.log("Compilation result: ", output.contracts);

    // let ABI = output.contracts[fName].Example.abi;
    // let bytecode = output.contracts[fName].Example.evm.bytecode.object;
    let ABI2 = output.contracts[fName].Credit.abi;
    let bytecode2 = output.contracts[fName].Credit.evm.bytecode.object;

    // fs.writeFileSync(__dirname + '/' + contractNames + '.abi', JSON.stringify(ABI));
    // fs.writeFileSync(__dirname + '/' + contractNames + '.bin', bytecode);
    fs.writeFileSync(__dirname + '/' + 'Credit' + '.abi', JSON.stringify(ABI2));
    fs.writeFileSync(__dirname + '/' + 'Credit' + '.bin', bytecode2);
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
    const ABI = JSON.parse(fs.readFileSync(__dirname + '/' + 'Credit.abi', 'utf-8'))
    const bytecode = fs.readFileSync(__dirname + '/' + 'Credit.bin', 'utf-8')
    // const ABI2 = JSON.parse(fs.readFileSync(__dirname + '/' + 'Example.abi', 'utf-8'))
    // const bytecode2 = fs.readFileSync(__dirname + '/' + 'Example.bin', 'utf-8')

    // Создает новый экземпляр контракта и связывает его с уже развёрнутым в сети контрактом
    let myContract = new web3.eth.Contract(ABI)
    // let myContract2 = new web3.eth.Contract(ABI2)
    
    // console.log(myContract2);
    
    // let percent  = readline.question("enter balance: ");
    let owner  = readline.question("enter address: ");
    // let bankBal  = readline.question("enter text: ");
    // let openCredit  = readline.question("enter text: ");

    // Деплой контракта Example
    // await myContract2.deploy({
    //     data: bytecode, 
    //     arguments: [owner]
    // })
    // .send({
    //     from: account.address,
    //     gas: 5000000 
    // })
    // // .on('receipt', (receipt) => {
    // //     console.log(receipt);
    // // })
    // .then(function(newContractInstance) {
    //         myContract2 = newContractInstance
    //     }
    // )
    
    // console.log(myContract2._address);

    // Деплой контракта Caller
    await myContract.deploy({
        data: bytecode, 
        arguments: [owner]
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
        1. getCredit(int256)
        2. repayLoan()
        3. recalculation(address)
        4. closeCredit(address)
        5. getCredits()
        6. withdraw(uint256)
        7. exit
        `)
        if (choose == 1) {
            let _bail  = readline.question("enter the loan amount: ");
            await myContract.methods.getCredit(_bail)
            //
            .send({ from: account.address })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log)
        } else if (choose == 2) {
            let _value  = readline.question("enter amount: ");
            await myContract.methods.repayLoan()
            .send({ from: account.address, value: _value })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log)
        } else if (choose == 3) {
            let debtor  = readline.question("enter address: ");
            await myContract.methods.callBalance(debtor)
            .send({ from: account.address, value: _value })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log)       
        } else if (choose == 4) {
            let debtor  = readline.question("enter address: ");
            await myContract.methods.closeCredit(debtor)
            .send({ from: account.address })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log) 
        } else if (choose == 5) {
            await myContract.methods.getCredits(index)
            .send({ from: account.address })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log)       
        } else if (choose == 6) {
            let value  = readline.question("enter amount: ");
            await myContract.methods.withdraw(value)
            .send({ from: account.address })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log)
        } else if (choose == 7) {
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

