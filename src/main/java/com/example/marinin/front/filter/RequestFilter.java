package com.example.marinin.front.filter;

import com.example.marinin.front.model.LoginRequest;
import com.example.marinin.front.model.LoginResponse;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Scanner;

public class RequestFilter extends GenericFilterBean {

    public void doFilter(final ServletRequest req, final ServletResponse res, final FilterChain chain)
            throws IOException, ServletException {


        final HttpServletRequest request = (HttpServletRequest) req;
        final HttpServletResponse response = (HttpServletResponse) res;

        final String requestURI = request.getRequestURI();
        final String requestMethod = request.getMethod();
        String accessType = getTypeOfAccess(request);
        String maxURL = "login";

        /*
         * invalid - if token was not sent or incorrect
         * user - if token belong to user
         * admin - if token belong to admin
         * error - if logining throw exception - redirect to /login?error
         **/

        if (requestURI.equals("/")) {
            if (accessType.equals("invalid")) {
                if (requestMethod.equals("GET")) {
                    chain.doFilter(req, res);
                } else if (requestMethod.equals("POST")) {
                    LoginResponse loginResponse = doLogin(request);
                    if (loginResponse.getToken() != null) {
                        response.addCookie(new Cookie("jwtToken", loginResponse.getToken()));
                        response.sendRedirect("/" + loginResponse.getAccessType());
                    } else {
                        response.sendRedirect("/");
                    }
                }
            } else {
                response.sendRedirect("/" + accessType);
            }
        } else if (requestURI.equals("/user")) {
            if (accessType.equals("user") || accessType.equals("admin")) {
                chain.doFilter(req, res);
            } else {
                response.sendRedirect("/");
            }
        } else if (requestURI.equals("/admin")) {
            if (accessType.equals("user")) {
                response.sendRedirect("/user");
            } else if (accessType.equals("admin")) {
                chain.doFilter(req, res);
            } else {
                response.sendRedirect("/");
            }
        } else if (requestURI.startsWith("/js")) {
            chain.doFilter(req, res);
        } else if (requestURI.equals("/logout")) {
            Cookie cookie = new Cookie("jwtToken", "");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
            response.sendRedirect("/");
        } else {
            response.sendRedirect("/");
        }

    }

    private LoginResponse doLogin(HttpServletRequest request) {
        LoginResponse loginResponse = new LoginResponse();
        LoginRequest loginRequest = new LoginRequest();
        RestTemplate restTemplate = new RestTemplate();

        try {
            Scanner scanner = new Scanner(request.getInputStream(), "UTF-8").useDelimiter("&");
            loginRequest.setUsername(scanner.next().substring(11));
            loginRequest.setPassword(scanner.next().substring(11));

            HttpEntity<LoginRequest> httpEntity = new HttpEntity<>(loginRequest);
            ResponseEntity<LoginResponse> responseEntity = restTemplate.exchange("http://localhost:8081/auth",
                    HttpMethod.POST, httpEntity, LoginResponse.class);

            loginResponse = responseEntity.getBody();
        } catch (Exception e) {
            loginResponse.setAccessType("error");
        }
        return loginResponse;
    }

    private String getTypeOfAccess(HttpServletRequest request) {
        String accessType;
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("jwtToken")) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token == null) {
            accessType = "invalid";
        } else {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Cookie", "jwtToken=" + token);
            HttpEntity<String> httpEntity = new HttpEntity<>(headers);
            try {
                ResponseEntity<String> response = restTemplate.exchange("http://localhost:8081/auth/access",
                        HttpMethod.GET, httpEntity, String.class);
                accessType = response.getBody();
            } catch (Exception e) {
                accessType = "invalid";
            }
        }
        return accessType;
    }
}
