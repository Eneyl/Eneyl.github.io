$(function(){

  'use strict';
  let _qestionTextContainer = $('#textContainer'),
      _answerOptions = $('#answersOptions'),
      questionElementArr = [],
      dataQuestion;

  async function getData(){
    let response = await fetch('js/question_db.json');
    if (response.ok) {
      dataQuestion = await response.json();
    } else {
      alert("Ошибка HTTP: " + response.status);
    }
  } 
  
  let timer = {
        start: 40,
        intervalId: 0,
        setTime: function () {
          let TickTime = this.start;
          this.intervalId = setInterval(() =>{  
            if (TickTime == 0){
              Computer.addScore();
              resetTimer();
              nextQuestion();
            } else if (numberQuestion == questionElementArr.length) {
              $('.timer').text('--');
              return;
            } 
            if (TickTime < 10) 
              $('.timer').text('0'+TickTime);
            else
              $('.timer').text(TickTime);
            TickTime--;
          }, 1000 )
        }
     }
    
  let scoreTemp,
      Player = {
        score: 0,
        addScore: function() {
          this.score += scoreTemp
          $('#score-bar-player').text(this.score);
        }
      },
      Computer = {
        score: 0,
        chance: 0,
        calcChance: function (){
          switch (scoreTemp) {
            case scoreTemp = 5:
              this.chance = 10;
              break;
            case scoreTemp = 10:
              this.chance = 30;
            case scoreTemp = 15:
              this.chance = 50;
            case scoreTemp = 20:
              this.chance = 70;
              break;
            default:
              alert('error score')
              break;
            }
          },
          addScore: function () {
            this.calcChance();
            if(Math.random() * 100 > this.chance)
              this.score += scoreTemp;
            
            $('#score-bar-comp').text(this.score);
          }
      };


  function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }
  
  function resetTimer() {
    $('.timer').text('--');
    clearInterval(timer.intervalId);
  }

  function resultGame() {
    Player.score > Computer.score ? $('.status-game').text('Победа') : $('.status-game').text('Проигрыш');
    $('.popup-game-status').fadeIn();
  }
  
  function createQuestion(data) {
    let questionElement,
        textElement,
        answerElement,
        answerElementArr,
        textAnswer,
        falseAnswerIndex,
        trueAnswerIndex,
        lettersArr,
        answerTextArr,
        answerTextContainer;

      data.forEach((item)=>{
        answerTextArr = [];
        lettersArr = [65];
        answerElementArr = []
        falseAnswerIndex = 0;
        trueAnswerIndex = 0;

        textElement = $(`<div class="qestion-text">${item.text}</div>`)
        for (let i = 0; i < item.ansTrue.length + item.ansFalse.length; i++) {
          if(i>0){
            lettersArr[i] = lettersArr[i-1] + 1;
          }
          if(i < item.ansFalse.length){
            textAnswer = item.ansFalse[falseAnswerIndex];
            falseAnswerIndex++;
          } else {
            textAnswer = item.ansTrue[trueAnswerIndex];
            trueAnswerIndex++;
          }
          answerTextArr.push(textAnswer);
        }

        shuffle(answerTextArr)
        answerTextContainer = $('<div class="answer-text-container"></div>')
        textElement.append(answerTextContainer);

        for (let i = 0; i < item.ansTrue.length + item.ansFalse.length; i++){
          answerTextContainer.append($(`<span>${String.fromCharCode(lettersArr[i])})${answerTextArr[i]}</span>`))
          answerElement = $(`<div class="answer-item"><div class="answer-item__text" value="${answerTextArr[i]}">${String.fromCharCode(lettersArr[i])}</div></div>`)
          answerElementArr.push(answerElement);
        }
        questionElement = {
          text: textElement,
          answerElementArr: answerElementArr,
          pointScore: item.pointScore,
          ansTrue: item.ansTrue
        }
        questionElementArr.push(questionElement);
      })
      shuffle(questionElementArr);
  }      

  let trueAnswerArr,
      numberQuestion = 0;

  function outputQuestion(index) {
    _qestionTextContainer.append(questionElementArr[index].text);
    for (let i = 0; i < questionElementArr[index].answerElementArr.length; i++) {
      _answerOptions.append(questionElementArr[index].answerElementArr[i]);
    }
    scoreTemp = questionElementArr[index].pointScore;
    trueAnswerArr = questionElementArr[index].ansTrue;
  }

  function nextQuestion(){
    timer.setTime();
    $('.qestion-text').remove();
    $('.answer-item').remove();
    numberQuestion++;
    if(numberQuestion < questionElementArr.length)
      outputQuestion(numberQuestion);
    else{
      resetTimer()
      $('#answer-btn').hide();
      $('#refresh-btn').show();
      resultGame();
    }
      
  }
 
  function checkAnswer(){
    let selectedAnswer = Array.from($('.select-answer')),
        isTrueSelected = selectedAnswer.every((item, i) => $(item).attr('value') == trueAnswerArr[i]),
        answerOptionsArr = Array.from($('.answer-item__text'));
    if(selectedAnswer.length != 0 && isTrueSelected){
      Player.addScore();
    }
    Computer.addScore();
    answerOptionsArr.forEach((item) => {
      for (let ans of trueAnswerArr){
        if($(item).attr('value') == ans){
          $(item).addClass('true-select');
        }
      }
      
    });
    resetTimer();
    setTimeout(nextQuestion, 2000);
  }

  $(_answerOptions).on('click', function (event) {
    if($(event.target).hasClass('answer-item__text'))
      $(event.target).toggleClass('select-answer');
  })
  $('#answer-btn').on('click', checkAnswer);
  $('#answer-btn').on('mouseover', ()=> $('#answer-btn .cls-34').css({fill: '#00fff0'}));
  $('#answer-btn').on('mouseout', ()=> $('#answer-btn .cls-34').css({fill: 'url(#Безымянный_градиент_19)'}));
  $('#start-btn').on('mouseover', ()=> $('#start-btn .cls-34').css({fill: '#00fff0'}));
  $('#start-btn').on('mouseout', ()=> $('#start-btn .cls-34').css({fill: 'url(#Безымянный_градиент_19)'}));
  $('#refresh-btn').on('mouseover', ()=> $('#refresh-btn .cls-34').css({fill: '#00fff0'}));
  $('#refresh-btn').on('mouseout', ()=> $('#refresh-btn .cls-34').css({fill: 'url(#Безымянный_градиент_19)'}));
  $('#refresh-btn').on('click', ()=> location = 'index.html');
  $('#start-btn').on('click', function () {
    getData()
      .then(()=>{
        $('#start-btn').hide();
        $('#answer-btn').show();
        createQuestion(dataQuestion)
        outputQuestion(numberQuestion)
        timer.setTime();
      });
  })
})