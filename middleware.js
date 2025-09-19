// middleware.js
module.exports = (req, res, next) => {
  // Interceptar respuestas POST/PUT para normalizar IDs
  const originalSend = res.send;
  
  res.send = function(body) {
    try {
      const data = JSON.parse(body);
      
      // Función recursiva para normalizar IDs
      const normalizeIds = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(normalizeIds);
        } else if (obj && typeof obj === 'object') {
          const result = {};
          for (const [key, value] of Object.entries(obj)) {
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
              result[key] = normalizeIds(value);
            }
          }
          return result;
        }
        return obj;
      };
      
      const normalizedData = normalizeIds(data);
      body = JSON.stringify(normalizedData);
    } catch (error) {
      // Si no es JSON, ignorar
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};