import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { EstimateDto, PreviewTemplateDto } from './dto/estimate.dto';
import { CreateProductTemplateDto, UpdateProductTemplateDto } from './dto/product-template.dto';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
import { UpdateDesignDto } from '../designs/dto/design.dto';
import { SAMPLE_PROFILES, SAMPLE_TEMPLATES } from './sample-data';

// Same options as the global pipe in main.ts
const pipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: { enableImplicitConversion: true },
});
const validate = (metatype: any, value: unknown) => pipe.transform(value, { type: 'body', metatype });

/** The template shape the admin editor sends (limits as null, isActive included). */
const editorTemplate = () => {
  const sample = SAMPLE_TEMPLATES[1];
  return {
    ...sample,
    isActive: true,
    sizeBands: sample.sizeBands.map((band) => ({
      maxWidthFt: null,
      maxHeightFt: null,
      maxAreaSqFt: null,
      maxPanelWidthFt: null,
      ...band,
    })),
  };
};
const input = { measurements: { width: `4'0"`, height: `4'0"` }, panels: 2, verticalBars: 0, horizontalBars: 1 };

describe('materials request validation', () => {
  it('accepts the admin editor preview, create and update payloads', async () => {
    const preview = await validate(PreviewTemplateDto, { template: editorTemplate(), input });
    expect(preview.template.sizeBands[0].maxPanelWidthFt).toBe(2.5);
    expect(preview.template.sizeBands[1].maxWidthFt).toBeUndefined(); // null → no limit

    await expect(validate(CreateProductTemplateDto, editorTemplate())).resolves.toBeDefined();

    const { productType: _p, systemType: _s, ...update } = editorTemplate();
    await expect(validate(UpdateProductTemplateDto, update)).resolves.toBeDefined();
  });

  it('accepts customer estimates with and without studio bars', async () => {
    await expect(
      validate(EstimateDto, {
        productType: 'window',
        systemType: 'sliding',
        measurements: { width: `5'2"`, height: `4'`, panelCount: 2 },
        panels: 2,
        color: 'black',
      }),
    ).resolves.toBeDefined();
    await expect(
      validate(EstimateDto, { productType: 'door', systemType: 'swing', measurements: { width: `3'`, height: `7'` } }),
    ).resolves.toBeDefined();
  });

  it('accepts profile create/update payloads and normalises the code', async () => {
    const created = await validate(CreateProfileDto, { ...SAMPLE_PROFILES[0], code: ' sw70-new ', isActive: true });
    expect(created.code).toBe('SW70-NEW');
    await expect(validate(UpdateProfileDto, { ...SAMPLE_PROFILES[0], isActive: false })).resolves.toBeDefined();
  });

  it('maps "none" to null so a catalogue design can clear its opening system', async () => {
    const cleared = await validate(UpdateDesignDto, { category: 'windows', systemType: 'none' });
    expect(cleared.systemType).toBeNull();
    const set = await validate(UpdateDesignDto, { category: 'windows', systemType: 'sliding' });
    expect(set.systemType).toBe('sliding');
  });

  it('rejects invalid input', async () => {
    await expect(
      validate(EstimateDto, { productType: 'ceiling', systemType: 'sliding', measurements: {} }),
    ).rejects.toThrow(BadRequestException);
    await expect(validate(CreateProductTemplateDto, { ...editorTemplate(), _id: 'abc' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(validate(UpdateDesignDto, { systemType: 'folding' })).rejects.toThrow(BadRequestException);

    const badAngle = editorTemplate();
    badAngle.sizeBands[0].lines[0] = { ...badAngle.sizeBands[0].lines[0], cutAngle: 30 as 45 };
    await expect(validate(PreviewTemplateDto, { template: badAngle, input })).rejects.toThrow(BadRequestException);
  });
});
