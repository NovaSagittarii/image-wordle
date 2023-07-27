const Gallery = document.querySelector('.gallery');

const paths = 'assets/004_644511ec.jpg assets/007_246e8b07.jpg assets/010_965b3b84.jpg assets/012_15673c30.jpg assets/017_8625d641.jpg assets/023_9a258cd1.jpg assets/043_d3e75e53.jpg assets/045_a3319249.jpg assets/050_c5067b3f.jpg assets/058_c154c45a.jpg assets/074_0465b577.jpg assets/080_96334b09.jpg assets/081_94a2ca09.jpg assets/082_00da54f1.jpg assets/083_6a2edd63.jpg assets/085_7dc990e1.jpg assets/086_05c07c92.jpg assets/091_916c27d5.jpg assets/097_b8338235.jpg assets/103_66c7ae3b.jpg assets/104_8194d1d5.jpg assets/110_0061ff91.jpg assets/112_1dd8dac4.jpg assets/114_ac11365a.jpg assets/117_c150e350.jpg assets/119_6e7cbe47.jpg assets/142_4c5a0b5f.jpg assets/143_bfe09ea3.jpg assets/147_d5e8b367.jpg assets/148_de01a097.jpg assets/151_681fd774.jpg assets/152_e01644cc.jpg assets/179_b3b7e6dd.jpg assets/188_df2dc723.jpg assets/189_18bdc5dc.jpg assets/192_69fc42a9.jpg assets/193_44ff968e.jpg assets/194_4b5a7447.jpg assets/198_89b7e9ca.jpg assets/201_afe65ae0.jpg'
  .split(' ')
  .map(suffix => [window.location.href.replace(/[\/ ]*$/, ''), suffix]
    .join('/')
  );
const images = [];
const usedPaths = shuffle([...paths]).slice(0, 24);

Promise.all(Object.entries(usedPaths).map(([i, path]) => new Promise((resolve, reject) => {
  try {
    const image = images[i] = new MarvinImage();
    image.load(path, () => resolve());
  } catch(e) {
    reject(e);
  }
}))).then(() => {
  const SIDE_LENGTH = 400;
  for(const image of shuffle([...images])){
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIDE_LENGTH;
    image.draw(canvas);
    image.canvas = canvas;
    Gallery.append(canvas);
    
    canvas.addEventListener('click', () => {
      const referenceImage = images[0];
      const CLOSE = 0, NEAR = 1, FAR = 2;
      let sum = 0;
      for(let x = 0; x < SIDE_LENGTH; x ++){
        for(let y = 0; y < SIDE_LENGTH; y ++){
          const r1 = image.getIntComponent0(x, y);
          const g1 = image.getIntComponent1(x, y);
          const b1 = image.getIntComponent2(x, y);
          const avg = ((r1 + g1 + b1) / 3)|0;
          const r2 = referenceImage.getIntComponent0(x, y);
          const g2 = referenceImage.getIntComponent1(x, y);
          const b2 = referenceImage.getIntComponent2(x, y);
          const cdist = ColorDistance(r1, g1, b1, r2, g2, b2);

          let verdict = FAR;
          if(cdist < 100) verdict = CLOSE;
          else if(cdist < 300) verdict = NEAR;
          sum += verdict;

          switch(verdict){
            case CLOSE: image.setIntColor(x, y, r2, g2, b2); break;
            case NEAR: image.setIntColor(x, y, avg, avg, avg); break;
            case FAR: image.setAlphaComponent(x, y, 0.3); break;
          }
        }
      }
      sum /= SIDE_LENGTH**2;
      let overallVerdict = '';
      if(sum >= 1.0) overallVerdict = 'gray';
      else if(sum >= 0.1) overallVerdict = 'yellow';
      else overallVerdict = 'green';
      canvas.classList.add(overallVerdict, 'selected');
      image.draw(canvas);
    });
  }
});

// https://stackoverflow.com/a/2450976/21507383
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// https://stackoverflow.com/a/40950076/21507383
// 0 ~ 765
function ColorDistance(r1, g1, b1, r2, g2, b2){
  const rmean = ( r1 + r2 ) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;
  return Math.sqrt((((512+rmean)*r*r)>>8) + 4*g*g + (((767-rmean)*b*b)>>8));
}