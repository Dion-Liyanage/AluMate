import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
const streamifier = require('streamifier');

type ResourceType = 'image' | 'video' | 'raw';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'alumate',
    resourceType: 'auto' | 'raw' | 'image' | 'video' = 'auto',
  ): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  /**
   * Extracts { publicId, resourceType } from a Cloudinary delivery URL, e.g.
   * https://res.cloudinary.com/<cloud>/image/upload/v123/alumate/projects/abc.png
   *   -> { publicId: 'alumate/projects/abc', resourceType: 'image' }
   * Raw files keep their extension as part of the public ID.
   * Returns null for non-Cloudinary URLs (e.g. legacy /uploads/... paths).
   */
  parseUrl(url: string): { publicId: string; resourceType: ResourceType } | null {
    if (!url || !url.includes('res.cloudinary.com')) return null;

    const match = url.match(/\/(image|video|raw)\/upload\/(.+)$/);
    if (!match) return null;

    const resourceType = match[1] as ResourceType;
    let path = match[2].split('?')[0];

    // Drop any transformation segments and the version (v12345/) prefix
    const versionMatch = path.match(/(?:^|\/)v\d+\/(.+)$/);
    if (versionMatch) path = versionMatch[1];

    const publicId =
      resourceType === 'raw' ? path : path.replace(/\.[^/.]+$/, '');

    return { publicId: decodeURIComponent(publicId), resourceType };
  }

  /**
   * Deletes the given Cloudinary assets. Non-Cloudinary URLs are skipped and
   * failures are logged, never thrown, so cleanup can't break the caller.
   */
  async deleteByUrls(urls: (string | undefined | null)[]): Promise<void> {
    const targets = urls
      .filter((u): u is string => !!u)
      .map((u) => this.parseUrl(u))
      .filter((t): t is { publicId: string; resourceType: ResourceType } => !!t);

    await Promise.all(
      targets.map(async ({ publicId, resourceType }) => {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true,
          });
        } catch (err: any) {
          this.logger.warn(
            `Failed to delete Cloudinary asset "${publicId}": ${err?.message ?? err}`,
          );
        }
      }),
    );
  }
}
