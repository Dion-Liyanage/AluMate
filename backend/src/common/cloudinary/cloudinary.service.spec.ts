
import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
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

  describe('parseUrl', () => {
    it('parses an image URL and strips the extension', () => {
      expect(
        service.parseUrl(
          'https://res.cloudinary.com/demo/image/upload/v1712345678/alumate/projects/abc123.png',
        ),
      ).toEqual({ publicId: 'alumate/projects/abc123', resourceType: 'image' });
    });

    it('keeps the extension for raw files', () => {
      expect(
        service.parseUrl(
          'https://res.cloudinary.com/demo/raw/upload/v1/alumate/designs/models/door.glb',
        ),
      ).toEqual({ publicId: 'alumate/designs/models/door.glb', resourceType: 'raw' });
    });

    it('ignores transformations before the version', () => {
      expect(
        service.parseUrl(
          'https://res.cloudinary.com/demo/image/upload/fl_attachment/v99/alumate/x.jpg',
        ),
      ).toEqual({ publicId: 'alumate/x', resourceType: 'image' });
    });

    it('returns null for non-Cloudinary URLs', () => {
      expect(service.parseUrl('/uploads/projects/123.png')).toBeNull();
    });
  });

  describe('deleteByUrls', () => {
    it('destroys only Cloudinary assets and swallows errors', async () => {
      (cloudinary.uploader.destroy as jest.Mock)
        .mockReset()
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValue({ result: 'ok' });

      await expect(
        service.deleteByUrls([
          'https://res.cloudinary.com/demo/image/upload/v1/alumate/a.png',
          '/uploads/projects/legacy.png',
          undefined,
          'https://res.cloudinary.com/demo/raw/upload/v1/alumate/m.glb',
        ]),
      ).resolves.toBeUndefined();

      expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('alumate/m.glb', {
        resource_type: 'raw',
        invalidate: true,
      });
    });
  });
});
