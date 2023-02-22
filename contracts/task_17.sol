// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

contract Wallet {

    mapping (address => uint256) balances;

    function addBalance() public payable {
        balances[msg.sender] += msg.value;
    }

    function transferEth(address recipient, uint256 value) public virtual {
        if (balances[msg.sender] >= value) {
            balances[msg.sender] -= value;
            balances[recipient] += value;
        }

    }

    function withdraw(uint256 value) public virtual {
        if (balances[msg.sender] >= value) {
            balances[msg.sender] -= value;
            payable(msg.sender).transfer(value);
        } 

    }
}

contract Bank {

    struct Stake {
        uint256 target;
        uint256 balance;
    }

    mapping (address => Stake) public stakes;

    function addStake(uint256 _target) public payable {
        require(stakes[msg.sender].target == 0 || stakes[msg.sender].target <= _target);
        if (_target > stakes[msg.sender].target) {
            stakes[msg.sender].target = _target;
        }
        stakes[msg.sender].balance += msg.value;
    }

    function unstake() public virtual {
        require(stakes[msg.sender].target <= stakes[msg.sender].balance);
        uint256 bal = stakes[msg.sender].balance;
        delete stakes[msg.sender];
        payable(msg.sender).transfer(bal);
    }
}

contract Credit is Wallet, Bank {

    address public owner;
    uint256 public percent;
    uint256 public bankBal;
    uint256 public openCredit;

    struct Credit {
        uint256 bail;
        uint256 debt;
        uint256 time;
        uint256 id;
        uint8 lastPay;
    }

    mapping (uint256 => address) public borrowers;
    mapping (address => Credit) public credits;
    

    constructor (uint256 _percent) payable {
        owner = msg.sender;
        percent = _percent;
        bankBal = msg.value;
    }

    function getCredit(uint256 _bail) public {
        // проверка по кредитам
        require(credits[msg.sender].bail == 0);
        // проверка баланса банка
        require(bankBal >= _bail);
        // проверка залога
        require(balances[msg.sender] + stakes[msg.sender].balance >= _bail * 2);
        // внесение в лист заемщиков
        openCredit++;
        credits[msg.sender] = Credit(_bail, _bail * 2, block.timestamp, openCredit, 0);
        borrowers[openCredit] = msg.sender;
        // выдача кредита
        bankBal -= _bail;
        payable(msg.sender).transfer(_bail);
    }

    function repayLoan() public payable {
        // проверка на платёж
        require(msg.value > 0);
        // проверка кредита
        require(credits[msg.sender].bail == 0);
        Credit memory credit = credits[msg.sender];
        // расчёт времени с последнего платежа
        uint8 month = uint8((block.timestamp - credit.time) / 30 days);
        // расчет процентов по задолженности
        for (uint8 i = 0; i < month - credit.lastPay; i++) {
            credit.bail += credit.bail * percent / 100;
        }
        // если платеж больше или равен задолженности
        if (msg.value >= credit.bail) {
            // присланная сумма идёт на счёт банка
            bankBal += credit.bail;
            // излишки платежа идут на счет заемщика
            balances[msg.sender] += msg.value - credit.bail;
            // удаляем адрес заемщика из списка
            // меняем его местами с последним в списке
            if (credit.id != openCredit) {
                credits[borrowers[openCredit]].id = credit.id;
                borrowers[credit.id] = borrowers[openCredit];
            }
            // закрываем кредит
            delete credits[msg.sender];
            delete borrowers[openCredit];
            openCredit--;
        }
        else {
            // присланная сумма идёт на счёт банка
            bankBal += msg.value;
            // перерасчет задолженности
            credit.bail -=msg.value;
            // перерасчет залога
            credit.debt = credit.bail * 2;
            // сохраняем время когда был внесен залог
            credit.lastPay = month;
            // сохраняем изменения
            credits[msg.sender] = credit;
        }
    }
   // закрываем просроченный кредит
    function closeCredit(address debtor) public {
        // вызывает только владелец банка
        require(msg.sender == owner);
        Credit memory credit = credits[debtor];
        // проверка, что кредит еще не выплачен
        require(credit.bail != 0);
        // подсчет времени с момента открытия кредита
        uint8 month = uint8((block.timestamp - credit.time) / 30 days);
        // проверяем, что прошло больше года или не было проплат более 4 месяцев
        require((month > 12) || (month = credit.lastPay) > 4);
        // рассчитываем проценты по долгу
        for (uint8 i = 0; i < month - credit.lastPay; i++) {
            credit.bail += credit.bail * percent / 100;
        }
        // расчет залога по остатку долга
        credit.debt = credit.bail * 2;
        // если залог больше счета и вклада вместе взятых
        if (credit.debt > balances[debtor] + stakes[debtor].balance) {
            // весь вклад и счет переходят на счет банка
            bankBal += balances[debtor] + stakes[debtor].balance;
            balances[debtor] = 0;
            stakes[debtor].balance = 0;
        }
        // если счет более залога
        else if (balances[debtor] > credit.debt) {
            // вычитываем весь залог из взноса заемщика
            balances[debtor] -= credit.debt;
            // залог уходит на счёт банка
            bankBal += credit.debt;
        }
        else {
            // вычитываем все что можно из счета заемщика
            bankBal += credit.debt;
            credit.debt -= balances[debtor];
            // оставшееся вычитываем из вклада заемщика
            balances[debtor] = 0;
            // залог уходит на счёт банка
            stakes[debtor].balance -= credit.debt;
        }
        // удаляем адрес заемщика из списка
        // меняем его местами с последним в списке
        if (credit.id != openCredit) {
            credits[borrowers[openCredit]].id = credit.id;
            borrowers[credit.id] = borrowers[openCredit];
        }
        // закрываем кредит
        delete credits[debtor];
        delete borrowers[openCredit];
        // уменьшаем кол-во открытых кредитов
        openCredit--;
    }

    // список кредитов
    function getCredits() external view returns(Credit[] memory) {
        require(msg.sender == owner);
        // создание список структур Credit
        Credit[] memory _credits = new Credit[] (openCredit);
        // вносим  все кредиты в массив
        for (uint8 i = 0; i < openCredit; i++) {
            _credits[i] = credits[borrowers[i + 1]];
        }
        return _credits;
    }

    // перерасчёт задолженности и залога
    function recalculation(address debtor) public returns(Credit memory) {
        Credit memory credit = credits[debtor];
        // проверка по кредиту(остаток)
        if (credit.bail != 0) {
            // расчёт времени с момента взятия кредита
            uint8 month = uint8((block.timestamp - credit.time) / 30 days);
            // расчет процентов по задолженности
            for (uint8 i = 0; i < month - credit.lastPay; i++) {
                credit.bail += credit.bail * percent / 100;
            }
            // обновление значения кредита
            credit.debt = credit.bail * 2;
            credits[debtor] = credit;
        }
        return credit;
    }

    function transferEth(address recipient, uint256 value) public override {
        require(balances[msg.sender] >= value);
        // перерасчет кредита
        recalculation(msg.sender);
        uint256 delta = balances[msg.sender] + stakes[msg.sender].balance - value;
        require(delta >= credits[msg.sender].debt);
        balances[msg.sender] -= value;
        balances[recipient] += value;
    }

    function withdraw(uint256 value) public override {
        require(balances[msg.sender] >= value);
        // перерасчет кредита
        recalculation(msg.sender);
        // проверка остатка средств для залога
        uint256 delta = balances[msg.sender] + stakes[msg.sender].balance - value;
        require(delta >= credits[msg.sender].debt);
        balances[msg.sender] -= value;
        payable(msg.sender).transfer(value);
    }

    function unstake() public override {  
        uint256 bal = stakes[msg.sender].balance;
        require(stakes[msg.sender].target <= stakes[msg.sender].balance);
        // перерасчет кредита
        recalculation(msg.sender);
        // проверка остатка после вывода средств
        require(balances[msg.sender] >= credits[msg.sender].debt);
        stakes[msg.sender].balance = 0;
        stakes[msg.sender].target = 0;
        payable(msg.sender).transfer(bal);
    }   
    // вывод ETH владельцу банка
    function withdrawBank(uint256 value) public {
        require(balances[msg.sender] >= value);
        payable(owner).transfer(value);
    }   
    // отправка ETH на контракт
    function sendEthBank() public payable {
        bankBal += msg.value;
    }
}
