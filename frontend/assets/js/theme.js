$('.datepicker').each(function(){
	var picker = new Pikaday({
		field: this
	});
});

function changeContact() {
    if (window.matchMedia("(max-width: 600px)").matches) {
        closeNav()
    }
}

function openNav() {
  document.getElementById("pullout").style.width = "100%";
  document.getElementById("mainscreen").style.width = "0%";
}

function closeNav() {
  document.getElementById("pullout").style.width = "0%";
  document.getElementById("mainscreen").style.width = "100%";
}
function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}