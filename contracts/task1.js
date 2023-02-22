const Web3 = require('web3')
const fs = require('fs');
const solc = require('solc');
const readline = require('readline-sync')
let web3 = new Web3('http://127.0.0.1:7545')
let fName = "task_35_1.sol";
let cName = "Example";

function myCompiler(solc, fileName, contractName, contractCode) {
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

    var output = JSON.parse(solc.compile(JSON.stringify(input)));

    //console.log("Compilation result: ", output);
    //console.log("Compilation result: ", output.contracts[fName]);

    let ABI = output.contracts[fName][contractName].abi;
    let bytecode = output.contracts[fName][contractName].evm.bytecode.object;
    // console.log(ABI);
    // console.log(bytecode);

    fs.writeFileSync(__dirname + '/' + contractName + '.abi', JSON.stringify(ABI));
    fs.writeFileSync(__dirname + '/' + contractName + '.bin', bytecode);
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
        // let solcx = solc.setupMethods(require('soljson -v0.8.15+commit.e14f2714'))
        // myCompiler(solcx, fName, cName, cCode)

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

    let key = "0xab97304cc92397f60e55448ab57260cb604b63b59359159dc21a2430866c4de1"
    let account = web3.eth.accounts.privateKeyToAccount(key)
    
    // считываение уже развернутого контракта по указаному пути
    const ABI = JSON.parse(fs.readFileSync(__dirname + '/' + 'Example.abi', 'utf-8'))
    const bytecode = fs.readFileSync(__dirname + '/' + 'Example.bin', 'utf-8')

    // Создает новый экземпляр контракта и связывает его с уже развёрнутым в сети контрактом
    let myContract = new web3.eth.Contract(ABI)
    //console.log(myContract);

    let x  = readline.question("enter x: ");
    let y  = readline.question("enter y: ");
    let str  = readline.question("enter str: ");

    // Деплой контракта
    await myContract.deploy({
        data: bytecode, 
        arguments: [x, y, str]
    })
    .send({
        from: account.address,
        gas: 1_000_000 
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
        1. addToMap(address, St)
        2. init(uint256)
        3. map(address)
        4. setStr(string)
        5. setXY(uint256, uint256)
        6. str()
        7. x()
        8. y()
        9. exit
        `)
        if (choose == 1) {
            let adr  = readline.question("enter address: ");
            let num  = readline.question("enter number: ");
            let _str  = readline.question("enter string: ");
            await myContract.methods.addToMap(adr, [num, _str])
            .send({ from: account.address })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log)
        } else if (choose == 2) {
            let count  = readline.question("enter count: ");
            await myContract.methods.init(count)
            .call() 
            .then(console.log)
        } else if (choose == 3) {
            let adr  = readline.question("enter address: ");
            await myContract.methods.map(adr).call().then(console.log)       
        } else if (choose == 4) {
            let _str  = readline.question("enter string: ");
            await myContract.methods.setStr(_str)
            .send({ from: account.address })
            .on('receipt', (receipt) => {
                console.log(receipt);
            })
            .then(console.log) 
        } else if (choose == 5) {
            let _x  = readline.question("enter x: ");
            let _y  = readline.question("enter y: ");
            await myContract.methods.setXY(_x, _y)
            .call()
            // этот метод не работает, но должен вроде как
            // .send({ from: account.address })
            // .on('receipt', (receipt) => {
            //     console.log(receipt);
            // })
            .then(console.log)       
        } else if (choose == 6) {
            await myContract.methods.str().call().then(console.log)
        } else if (choose == 7) {
            await myContract.methods.x().call().then(console.log)
        } else if (choose == 8) {
            await myContract.methods.y().call().then(console.log)
        } else if (choose == 9) {
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

