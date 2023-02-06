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
  let recommendedProductHTML = `<div><h2>Based on your selections, we recommend the following products</h2><div style='display: flex; overflow: auto'>`;

  recommendedProducts.forEach((result, i) => {
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
    recommendedProductHTML += `<div class="items-container"> <div class="item" id="item${i}"> <div class="diamond-container"> <div class="diamond"> <div class="diamond-wrapper"> <div class="diamond-content"> £ ${recommendedProduct.productSuggestion.variants.edges[0].node.price} </div> </div> </div> </div> <div class="item-wrapper"> <div class="content-wrapper"> <div class="img-container"> <div class="bg-square"></div> <img class="item-img" src="${imgUrl}" /> </div> <div class="content-text"> <div class="item-name"> ${recommendedProduct.productSuggestion.title} </div> <div class="item-subtext-container"> <span class="item-subtext subtext-mfr" >${recommendedProduct.productSuggestion.vendor}</span > </div> </div> </div> <div class="view-more-btn" id="view${i}" onClick="viewMore(${i})"> View More <span class="view-symbol">+</span> </div> <div class="item-details-container"> <div class="details-content-wrapper"> <div class="detail"> <span class="detail-title">Item | </span> <span class="detail-text detail-name" >${recommendedProduct.productSuggestion.title}</span > </div> <div class="detail"> <span class="detail-title">MFR | </span> <span class="detail-text mfr-name" >${recommendedProduct.productSuggestion.vendor}</span > </div> <div class="detail"> <span class="detail-title">Price | </span> <span class="detail-text detail-price" >£${recommendedProduct.productSuggestion.variants.edges[0].node.price}</span > </div> <div class="detail detail-desc"> <div class="detail-title">Description</div> <div class="detail-description"> ${recommendedProduct.productSuggestion.body} </div> <a href="/products/${productLink}" target="_blank"> <div class="detail-manual-link"> <div class="manual-icon-container"> <svg class="manual-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 465 465" style="enable-background: new 0 0 465 465" xml:space="preserve" width="512px" height="512px" > <g> <path d="M240,356.071V132.12c0-4.143-3.357-7.5-7.5-7.5s-7.5,3.357-7.5,7.5v223.951c0,4.143,3.357,7.5,7.5,7.5 S240,360.214,240,356.071z" fill="#f1f1f1" /> <path d="M457.5,75.782c-15.856,0-35.614-6.842-56.533-14.085c-26.492-9.174-56.521-19.571-87.663-19.571 c-36.035,0-58.019,15.791-70.115,29.038c-4.524,4.956-8.03,9.922-10.688,14.327c-2.658-4.405-6.164-9.371-10.688-14.327 c-12.097-13.247-34.08-29.038-70.115-29.038c-31.143,0-61.171,10.397-87.663,19.571C43.114,68.94,23.356,75.782,7.5,75.782 c-4.143,0-7.5,3.357-7.5,7.5v302.092c0,4.143,3.357,7.5,7.5,7.5c18.38,0,39.297-7.243,61.441-14.911 c25.375-8.786,54.136-18.745,82.755-18.745c24.54,0,44.403,8.126,59.038,24.152c2.792,3.058,7.537,3.273,10.596,0.48 s3.273-7.537,0.48-10.596c-12.097-13.246-34.08-29.037-70.114-29.037c-31.143,0-61.171,10.397-87.663,19.571 C46.298,369.931,29.396,375.782,15,377.422V90.41c16.491-1.571,34.755-7.896,53.941-14.539 c25.375-8.786,54.136-18.745,82.755-18.745c57.881,0,73.025,45.962,73.634,47.894c0.968,3.148,3.876,5.298,7.17,5.298 s6.202-2.149,7.17-5.298c0.146-0.479,15.383-47.894,73.634-47.894c28.619,0,57.38,9.959,82.755,18.745 c19.187,6.644,37.45,12.968,53.941,14.539v287.012c-14.396-1.64-31.298-7.491-49.033-13.633 c-26.492-9.174-56.521-19.571-87.663-19.571c-36.036,0-58.02,15.791-70.115,29.038c-2.793,3.06-2.578,7.803,0.48,10.596 c3.06,2.793,7.804,2.578,10.596-0.48c14.635-16.027,34.498-24.153,59.039-24.153c28.619,0,57.38,9.959,82.755,18.745 c22.145,7.668,43.062,14.911,61.441,14.911c4.143,0,7.5-3.357,7.5-7.5V83.282C465,79.14,461.643,75.782,457.5,75.782z" fill="#f1f1f1" /> <path d="M457.5,407.874c-15.856,0-35.614-6.842-56.533-14.085c-26.492-9.174-56.521-19.571-87.663-19.571 c-33.843,0-55.291,13.928-67.796,26.596l-26.017-0.001c-12.505-12.668-33.954-26.595-67.795-26.595 c-31.143,0-61.171,10.397-87.663,19.571c-20.919,7.243-40.677,14.085-56.533,14.085c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5,7.5,7.5 c18.38,0,39.297-7.243,61.441-14.911c25.375-8.786,54.136-18.745,82.755-18.745c24.54,0,44.403,8.126,59.038,24.152 c1.421,1.556,3.431,2.442,5.538,2.442l32.454,0.001c2.107,0,4.117-0.887,5.538-2.442c14.635-16.027,34.498-24.153,59.039-24.153 c28.619,0,57.38,9.959,82.755,18.745c22.145,7.668,43.062,14.911,61.441,14.911c4.143,0,7.5-3.357,7.5-7.5 S461.643,407.874,457.5,407.874z" fill="#f1f1f1" /> </g> </svg> </div> <div class="manual-link-text">View Full Product Page</div> </div> </a> </div> </div> </div> </div> </div></div>`;
  });

  recommendedProductHTML += "</div></div>";
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

          // const submit_btn = this.querySelector("#quiz-submit");
          // console.log(submit_btn);
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
              `<span class="dot slide-${i}" onclick="currentSlide(${i})"></span>`
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
              `<div class="product-quiz__question-answers"></div><div class="quiz-navigation"><a class="prev" onclick="plusSlides(-1)">&#10094;<span>Back</span></a> <a class="next" onclick="plusSlides(1)"><span>Next</span>&#10095;</a></div>`
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
