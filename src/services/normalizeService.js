// src/services/normalizeService.js
export const normalizeData = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalizeData);
  }
  
  if (data && typeof data === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id' || key.endsWith('Id') || key === 'members') {
        if (Array.isArray(value)) {
          result[key] = value.map(v => 
            typeof v === 'string' && !isNaN(v) ? parseInt(v, 10) : v
          );
        } else if (typeof value === 'string' && !isNaN(value)) {
          result[key] = parseInt(value, 10);
        } else {
          result[key] = value;
        }
      } else {
        result[key] = normalizeData(value);
      }
    }
    return result;
  }
  
  return data;
};