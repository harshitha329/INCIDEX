export default { content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme:{extend:{fontFamily:{sans:['Inter','ui-sans-serif','system-ui','sans-serif']},
  colors:{ink:{950:'#06080c',900:'#0a0d13',800:'#0e1218',700:'#141a23'}},
  keyframes:{up:{from:{opacity:0,transform:'translateY(8px)'},to:{opacity:1,transform:'none'}},pop:{from:{opacity:0,transform:'scale(.96)'},to:{opacity:1,transform:'none'}},bar:{'0%':{transform:'translateX(-100%)'},'100%':{transform:'translateX(250%)'}}},
  animation:{up:'up .35s ease-out both',pop:'pop .2s ease-out both',bar:'bar 1.6s ease-in-out infinite'}}},plugins:[]}
