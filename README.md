# BU-HomeWork35
web3 homework download lib web3(yarn add web3/npm install web3) 
web3 homework download lib readline-sync(yarn add readline-sync/npm install readline-sync)
web3 homework download lib solc(yarn add solc@0.8.17+commit.8df45f5f/npm install solc@0.8.17+commit.8df45f5f)

Документация по компилятору: https://www.npmjs.com/package/solc


Задача 1

Напишите скрипт, который развёртывает в сети контракт из файла task_35_1.sol 

Далее скрипт выводит список методов, которые можно вызывать на контракте, включая get-методы для публичных переменных, и предлагает выбрать один из методов для вызова, либо выбрать пункт “завершить работу”, в случае выбора которого скрипт завершает работу

Далее для методов, которые принимают аргументы, скрипт предлагает ввести значения этих аргументов

Далее происходит вызов нужного метода
Если метод возвращает значения (платные методы в том числе), то они должно быть выведены в консоль

После этого снова выводится меню выбора метода (выхода из программы)

Очень важно правильно реализовать вызов и работу со всеми методами контракта!


Задача 2

Напишите скрипт, который развёртывает в сети оба контракта из файла task_35_2.sol 

Далее скрипт выводит список методов, которые можно вызывать на контракте caller и предлагает выбрать один из методов для вызова, либо выбрать пункт “завершить работу”, в случае выбора которого скрипт завершает работу

Далее для методов, которые принимают аргументы, скрипт предлагает ввести значения этих аргументов

Далее происходит вызов нужного метода
Реализуйте при помощи методов контракта caller вызов всех методов контракта example включая get-методы для публичных переменных

После этого снова выводится меню выбора метода (выхода из программы)

Очень важно правильно реализовать вызов и работу со всеми методами контракта!


Задача 3

В уроке 17 (наследование) вы реализовывали контракт credit 

Напишите скрипт для работы с этим контрактом