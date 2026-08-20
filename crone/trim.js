(()=>{
  const intro=document.querySelector('.intro');
  if(!intro)return;
  const next=intro.nextElementSibling;
  intro.remove();
  if(next&&next.classList.contains('rule'))next.remove();
  const top=document.querySelector('.top');
  if(top)top.style.marginBottom='22px';
})();
