export const isPlaceholderUrl = (url) => {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('aida-public') || 
         lowerUrl.includes('googleusercontent') || 
         lowerUrl.includes('placehold.co') || 
         lowerUrl.includes('placeholder') || 
         lowerUrl.includes('placehold.it');
};
