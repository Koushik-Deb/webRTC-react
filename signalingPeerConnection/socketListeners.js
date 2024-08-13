socket.on("availableOffers", (offers) => {
  console.log("available offers received ", offers);
  createOfferEls(offers);
});

socket.on("newOfferAwaiting", (offers) => {
  console.log("new offer awaiting ", offers);
  createOfferEls(offers);
});

socket.on("answerResponse", (offerObj) => {
  addAnswer(offerObj);
});

function createOfferEls(offers) {
  const answerEl = document.querySelector("#answer");
  offers.forEach((o) => {
    console.log("offer in createOfferEls ", o);
    const newOfferEl = document.createElement("div");
    newOfferEl.innerHTML = `<button class="btn btn-success col-1">Answer ${o.offererUserName}</button>`;
    newOfferEl.addEventListener("click", () => answerOffer(o));
    answerEl.appendChild(newOfferEl);
  });
}
