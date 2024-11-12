import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

describe('MailService', () => {
  let service: MailService;
  let transporterMock: jest.Mocked<nodemailer.Transporter>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);

    transporterMock = (nodemailer.createTransport as jest.Mock).mock.results[0]
      .value;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordResetEmail', () => {
    it('should send an email with the correct options', async () => {
      const to = 'test@example.com';
      const resetLink = 'http://localhost/reset-password/1234';

      await service.sendPasswordResetEmail(to, resetLink);

      expect(transporterMock.sendMail).toHaveBeenCalledWith({
        from: `"Quackwell Support" <${process.env.MAIL_FROM}>`,
        to,
        subject: 'Password Reset Request',
        html: expect.stringContaining(resetLink),
        text: expect.stringContaining(resetLink),
      });
    });

    it('should throw an InternalServerErrorException if sending fails', async () => {
      const to = 'test@example.com';
      const resetLink = 'http://localhost/reset-password/1234';

      transporterMock.sendMail.mockRejectedValueOnce(
        new Error('Failed to send email'),
      );

      await expect(
        service.sendPasswordResetEmail(to, resetLink),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
