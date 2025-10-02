const modal = document.getElementById('myModal');
const btn = document.querySelector('.js-questions');
const span = document.getElementsByClassName("close")[0];
if (btn) btn.onclick = function () { modal.style.display = "block"; }
span.onclick = function () { modal.style.display = "none"; }
window.onclick = function (event) {
    if (event.target == modal) { modal.style.display = "none"; }
}