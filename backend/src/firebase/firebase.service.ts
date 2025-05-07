import { Injectable } from '@nestjs/common';
import { storage } from '../config/firebase.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Injectable()
export class FirebaseService {
  async uploadImage(file: Express.Multer.File, path?: string): Promise<string> {
    try {
      // Procesar la ruta
      let storagePath: string;
      
      if (path) {
        // Limpiar la ruta: permitir letras, números, guiones, guiones bajos y forward slashes
        const cleanPath = path
          .split('/')
          .map(segment => segment.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase())
          .filter(segment => segment.length > 0)
          .join('/');
          
        storagePath = `${cleanPath}/${file.originalname}`;
      } else {
        // Si no hay ruta, usar el comportamiento predeterminado
        const dateString = new Date().getTime();
        storagePath = `images/${dateString}-${file.originalname}`;
      }

      // Crear una referencia única para el archivo
      const storageRef = ref(storage, storagePath);

      // Subir el archivo
      const snapshot = await uploadBytes(storageRef, file.buffer);

      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
  }
} 