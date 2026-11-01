package com.college.portal.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
        "/login",
        "/home",
        "/departments"
    })
    public String forward() {
        return "forward:/index.html";
    }
}