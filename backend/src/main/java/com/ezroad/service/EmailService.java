package com.ezroad.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "https://linkisy.kr/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("dlwornjs0316@gmail.com");
        message.setTo(to);
        message.setSubject("[linkisy] 비밀번호 재설정 안내");
        message.setText("안녕하세요, linkisy입니다.\n\n" +
                "비밀번호 재설정을 위해 아래 링크를 클릭해주세요.\n" +
                "링크는 1시간 동안만 유효합니다.\n\n" +
                resetUrl + "\n\n" +
                "만약 비밀번호 재설정을 요청하지 않으셨다면 이 메일을 무시해주세요.");

        try {
            mailSender.send(message);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
            throw new RuntimeException("메일 발송에 실패했습니다");
        }
    }
}
