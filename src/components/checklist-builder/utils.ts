import { v4 as uuidv4 } from 'uuid';

export const generateId = () => `field_${uuidv4()}`;
