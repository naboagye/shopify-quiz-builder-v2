// initialize an API client object
// const api = new Gadget();
// const QUIZ_ID = 1; // <- UPDATE ME WITH QUIZ ID FROM GADGET
const QUIZ_ID = document.getElementById("quizid").value;

// let api;
async function loading() {
  let g = await import("https://quiz-creator.gadget.app/api/client/web.min.js");
  window.api = new Gadget({
    environment: "Development",
  });
}

// query Gadget for the recommended products based on quiz answers
async function fetchRecommendedProducts(answerIds) {
  const queryIdFilter = answerIds.map((answerId) => {
    return { id: { equals: answerId } };
  });

  const recommendedProducts = await api.answer.findMany({
    filter: {
      OR: queryIdFilter,
    },
    select: {
      recommendedProduct: {
        id: true,
        image: {
          url: true,
        },
        productSuggestion: {
          id: true,
          title: true,
          body: true,
          handle: true,
          vendor: true,
          images: {
            edges: {
              node: {
                id: true,
                source: true,
              },
            },
          },
          variants: {
            edges: {
              node: {
                id: true,
                price: true,
              },
            },
          },
        },
      },
    },
  });

  return recommendedProducts;
}

// fetch the quiz questions and answers to be presented to shoppers
async function fetchQuiz(quizId) {
  const go = await loading();
  const quiz = await api.quiz.findOne(quizId, {
    select: {
      id: true,
      title: true,
      body: true,
      questions: {
        edges: {
          node: {
            id: true,
            text: true,
            limit: true,
            answers: {
              edges: {
                node: {
                  id: true,
                  text: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return quiz;
}

// save the shopper's email and recommended productions to Gadget (for follow-up emails!)
async function saveSelections(email, recommendedProducts) {
  const productsQuery = recommendedProducts.map((rp) => {
    return {
      create: {
        product: {
          _link: rp.recommendedProduct.productSuggestion.id,
        },
      },
    };
  });
  await api.quizResult.create({
    quizResult: {
      quiz: {
        _link: QUIZ_ID,
      },
      email: email,
      shopperSuggestions: [...productsQuery],
    },
  });
}

async function onSubmitHandler(evt) {
  evt.preventDefault();
  selectAnswer();

  const email = document.getElementById("product-quiz__email").value;

  const submitButton = this.querySelector(".product-quiz__submit");
  submitButton.classList.add("disabled");

  const recommendedProducts = await fetchRecommendedProducts(selectedAnswers);

  // save email and recommendations to Gadget for follow-up emails
  await saveSelections(email, recommendedProducts);

  // display recommendations
  let recommendedProductHTML = `<div><h2>Based on your selections, we recommend the following products</h2><div style='display: flex; overflow: auto'><slider-component class="slider-mobile-gutter page-width page-width-desktop">
    <ul id="Slider-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2" class="grid product-grid contains-card contains-card--product contains-card--standard grid--4-col-desktop grid--2-col-tablet-down" role="list" aria-label="Slider"><li id="Slide-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-1" class="grid__item">`;

  recommendedProducts.forEach((result) => {
    const { recommendedProduct } = result;
    const imgUrl =
      recommendedProduct.image != null
        ? recommendedProduct.image.url
        : recommendedProduct.productSuggestion.images.edges[0].node.source;
    const productLink = recommendedProduct.productSuggestion.handle;
    // recommendedProductHTML +=
    //   `<span style="padding: 8px 16px; margin-left: 10px; border: black 1px solid; align-items: center; display: flex; flex-direction: column"><h3>${recommendedProduct.productSuggestion.title}</h3><a class="button" href="/products/${productLink}">Check it out</a>` +
    //   recommendedProduct.productSuggestion.body +
    //   `<br/><img src=${imgUrl} width="200px" /><br /></span>`;
    recommendedProductHTML += `<li id="Slide-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-1" class="grid__item"> <link href="//cdn.shopify.com/s/files/1/0673/1930/0384/t/1/assets/component-rating.css?v=24573085263941240431667423995" rel="stylesheet" type="text/css" media="all" /> <div class="card-wrapper product-card-wrapper underline-links-hover"> <div class="card card--standard card--media" style="--ratio-percent: 125%"> <div class="card__inner color-background-2 gradient ratio" style="--ratio-percent: 125%" > <div class="card__media"> <div class="media media--transparent media--hover-effect"> <img srcset=" //cdn.shopify.com/s/files/1/0673/1930/0384/products/photo-1611930022073-b7a4ba5fcccd.jpg?v=1673721965&amp;width=165 165w, //cdn.shopify.com/s/files/1/0673/1930/0384/products/photo-1611930022073-b7a4ba5fcccd.jpg?v=1673721965&amp;width=360 360w, //cdn.shopify.com/s/files/1/0673/1930/0384/products/photo-1611930022073-b7a4ba5fcccd.jpg?v=1673721965&amp;width=533 533w, //cdn.shopify.com/s/files/1/0673/1930/0384/products/photo-1611930022073-b7a4ba5fcccd.jpg?v=1673721965&amp;width=720 720w, //cdn.shopify.com/s/files/1/0673/1930/0384/products/photo-1611930022073-b7a4ba5fcccd.jpg?v=1673721965&amp;width=940 940w, //cdn.shopify.com/s/files/1/0673/1930/0384/products/photo-1611930022073-b7a4ba5fcccd.jpg?v=1673721965 1000w " src=${imgUrl} sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)" alt="weathered hill" class="motion-reduce" loading="lazy" width="1000" height="1500" /> </div> </div> <div class="card__content"> <div class="card__information"> <h3 class="card__heading"> <a href="/products/${productLink}" id="StandardCardNoMediaLink-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-7981045481760" class="full-unstyled-link" aria-labelledby="StandardCardNoMediaLink-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-7981045481760 NoMediaStandardBadge-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-7981045481760" > ${recommendedProduct.productSuggestion.title} </a> </h3> </div> <div class="card__badge bottom left"></div> </div> </div> <div class="card__content"> <div class="card__information"> <h3 class="card__heading h5" id="title-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-7981045481760" > <a href="/products/${productLink}" id="CardLink-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-7981045481760" class="full-unstyled-link" aria-labelledby="CardLink-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-7981045481760 Badge-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-7981045481760" > ${recommendedProduct.productSuggestion.title} </a> </h3> <div class="card-information"> <span class="visually-hidden">Vendor:</span> <div class="caption-with-letter-spacing light"> ${recommendedProduct.productSuggestion.vendor} </div> <span class="caption-large light"></span> <div class="price"> <div class="price__container"> <div class="price__regular"> <span class="visually-hidden visually-hidden--inline" >Regular price</span > <span class="price-item price-item--regular"> ${recommendedProduct.productSuggestion.variants.edges[0].node.price} </span> </div> <div class="price__sale"> <span class="visually-hidden visually-hidden--inline" >Regular price</span > <span> <s class="price-item price-item--regular"> </s> </span ><span class="visually-hidden visually-hidden--inline" >Sale price</span > <span class="price-item price-item--sale price-item--last"> ${recommendedProduct.productSuggestion.variants.edges[0].node.price} </span> </div> <small class="unit-price caption hidden"> <span class="visually-hidden">Unit price</span> <span class="price-item price-item--last"> <span></span> <span aria-hidden="true">/</span> <span class="visually-hidden">&nbsp;per&nbsp;</span> <span> </span> </span> </small> </div> </div> </div> </div> <div class="quick-add no-js-hidden"> <product-form ><form method="post" action="/cart/add" id="quick-add-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc27981045481760" accept-charset="UTF-8" class="form" enctype="multipart/form-data" novalidate="novalidate" data-type="add-to-cart-form" > <input type="hidden" name="form_type" value="product" /><input type="hidden" name="utf8" value="✓" /><input type="hidden" name="id" value="43697096229152" /> <button id="quick-add-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc27981045481760-submit" type="submit" name="add" class="quick-add__submit button button--full-width button--secondary" aria-haspopup="dialog" aria-labelledby="quick-add-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc27981045481760-submit title-template--16816114368800__01eef60b-2b83-48b4-ba27-abec11e33cc2-7981045481760" aria-live="polite" data-sold-out-message="true" > <span>Add to cart </span> <span class="sold-out-message hidden"> Sold out </span> <div class="loading-overlay__spinner hidden"> <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg" > <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30" ></circle> </svg> </div> </button></form ></product-form> </div> <div class="card__badge bottom left"></div> </div> </div> </div></li>`;
  });

  recommendedProductHTML += "</ul></slider-component></div></div>";
  document.getElementById("questions").innerHTML = recommendedProductHTML;

  submitButton.classList.add("hidden");
  this.querySelector(".product-quiz__submit-hr").classList.add("hidden");
  this.querySelector(".product-quiz__email-container").classList.add("hidden");
}

let answerLimit = [3, 1, 1, 1, 1, 3, 1, 1];
function getAnswerLimit(questionNumber) {
  let limit = answerLimit[questionNumber];
  return limit;
}

let selectedAnswers = [];
// function selectAnswer(answerId, answerText) {
//   selectedAnswers.push(answerId);
//   let elId = event.srcElement.id;
//   let parent = document.getElementById(elId).parentNode;
//   parent.innerHTML = "<h3><b>" + decodeURI(answerText) + "</b> selected</h3>";
// }

function selectAnswer() {
  // selectedAnswers.push(answer);
  all_checkboxes = Array.from(
    document.getElementsByClassName("answer_checkbox")
  );
  selectedAnswers = all_checkboxes
    .filter((checkbox) => {
      return checkbox.checked;
    })
    .map((checked_checkbox) => checked_checkbox.value);

  console.log("a", selectedAnswers);
}

fetchQuiz(QUIZ_ID).then(async (quiz) => {
  const questions = quiz.questions.edges;

  if (!customElements.get("product-quiz")) {
    customElements.define(
      "product-quiz",
      class ProductQuiz extends HTMLElement {
        constructor() {
          super();
          this.form = this.querySelector("form");
          this.heading = this.querySelector(".product-quiz__title");
          this.heading.innerHTML = quiz.title;
          this.body = this.querySelector(".product-quiz__body span");
          this.body.innerHTML = quiz.body;
          this.questions = this.querySelector(".product-quiz__questions");

          // const questionContainer = this.querySelector(
          //   ".product-quiz__question"
          // );
          const answerContainer = this.querySelector(
            ".product-quiz__question-answer"
          );

          this.questions = this.querySelector(".slideshow-container");
          const questionContainer = this.querySelector(".mySlides");
          const slideDots = this.querySelector(".slide-dots");

          for (let i = 1; i <= questions.length; i++) {
            slideDots.insertAdjacentHTML(
              "beforeend",
              `<span class="dot" onclick="currentSlide(${i})"></span>`
            );
          }

          const renderedQuestions = questions.forEach((question, i) => {
            const clonedDiv = questionContainer.cloneNode(true);
            clonedDiv.id = "question_" + i;
            clonedDiv.insertAdjacentHTML(
              "beforeend",
              "<br /><div class='question-text'><h1>" +
                question.node.text +
                `</h1></div>`
            );
            clonedDiv.insertAdjacentHTML(
              "beforeend",
              '<div class="product-quiz__question-answers"></div>'
            );
            this.questions.appendChild(clonedDiv);

            const answers = question.node.answers.edges;
            const limit = question.node.limit;
            answers.forEach((answer, j) => {
              const clonedSpan = answerContainer.cloneNode(true);
              clonedSpan.id = "answer_" + i + "_" + j;
              // clonedSpan.insertAdjacentHTML(
              //   "beforeend",
              //   `<span><button class="button answer" id="${
              //     clonedSpan.id
              //   }" onClick=(selectAnswer(${
              //     answer.node.id
              //   },"${encodeURIComponent(answer.node.text)}"))>${
              //     answer.node.text
              //   }</button></span>`
              // );
              clonedSpan.insertAdjacentHTML(
                "beforeend",
                `<div class = "answers_checkbox answer cat action q${i}_answer" id="${clonedSpan.id}"  >
                  <label>
                    <input name='ckb_${i}' onclick='chkcontrol(${j},${answer.node.id}, ${i}, ${limit})' class="answer_checkbox" type="checkbox" value=${answer.node.id}>
                      <span>
                        <a>${answer.node.text}</a>
                      </span>
                  </label>
                <div>
                <br/>
                <br/>`
              );
              // this.querySelector(`.product-quiz__answers_${i}`).appendChild(
              //   clonedSpan
              // );
              clonedDiv.children[5].appendChild(clonedSpan);
            });
          });
          this.questions.removeChild(this.questions.children[0]);
          this.form.addEventListener("submit", onSubmitHandler);
        }
      }
    );
  }
});
