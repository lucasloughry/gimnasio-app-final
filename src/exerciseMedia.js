// Original, unmodified GIFs. Attribution is displayed alongside each demonstration.
const commons = (file,author,version='3.0') => ({
  url:`https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}`,
  source:`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,
  author, license:`CC BY-SA ${version}`, licenseUrl:`https://creativecommons.org/licenses/by-sa/${version}/`,
});
export const EXERCISE_MEDIA = {
  'Flexiones':commons('Pushups.gif','Wensceslao','4.0'),
  'Dominadas':commons('Pullup.gif','Extremistpullup'),
  'Aperturas con mancuernas':commons('DumbbellFlye.gif','Mohamed Ouda'),
  'Sentadilla sin carga':{...commons('Squats 01.gif','Zimmermanns'),license:'CC BY 3.0',licenseUrl:'https://creativecommons.org/licenses/by/3.0/'},
};
