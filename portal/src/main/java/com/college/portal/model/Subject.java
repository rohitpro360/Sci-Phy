package com.college.portal.model;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    // Yahan Department relation add karo
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // Constructors
    public Subject() {}

    public Subject(String name, String code, Department department) {
        this.name = name;
        this.code = code;
        this.department = department;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
}