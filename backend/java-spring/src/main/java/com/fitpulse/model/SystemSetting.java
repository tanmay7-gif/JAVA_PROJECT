package com.fitpulse.model;

import com.fitpulse.model.base.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Domain entity representing runtime platform configurations and maintenance flags.
 * Demonstrates OOP Inheritance extending BaseEntity.
 */
@Entity
@Table(name = "system_settings", indexes = {
    @Index(name = "idx_setting_key", columnList = "setting_key", unique = true)
})
public class SystemSetting extends BaseEntity {

    @NotBlank(message = "Setting key cannot be blank")
    @Column(name = "setting_key", nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    @Column(length = 255)
    private String description;

    public SystemSetting() {
        super();
    }

    public SystemSetting(String settingKey, String settingValue) {
        super();
        this.settingKey = settingKey;
        this.settingValue = settingValue;
    }

    public SystemSetting(String settingKey, String settingValue, String description) {
        super();
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.description = description;
    }

    // Encapsulation: Getters and Setters
    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
