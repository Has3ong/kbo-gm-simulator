package com.kbo.gm;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.kbo.gm")
public class KboGmApplication {
    public static void main(String[] args) {
        SpringApplication.run(KboGmApplication.class, args);
    }
}
