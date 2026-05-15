
import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should successfully upload a file', async () => {
      const mockFile = {
        buffer: Buffer.from('test text'),
        originalname: 'test.png',
      } as Express.Multer.File;

      const mockResponse = { secure_url: 'https://cloudinary.com/test.png' };
      
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        callback(null, mockResponse);
        return { pipe: jest.fn() };
      });

      const result = await service.uploadFile(mockFile);

      expect(result.secure_url).toBe(mockResponse.secure_url);
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    });

    it('should throw an error if upload fails', async () => {
      const mockFile = {
        buffer: Buffer.from('test text'),
      } as Express.Multer.File;

      const mockError = new Error('Upload failed');
      
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        callback(mockError, null);
        return { pipe: jest.fn() };
      });

      await expect(service.uploadFile(mockFile)).rejects.toThrow('Upload failed');
    });
  });
});
