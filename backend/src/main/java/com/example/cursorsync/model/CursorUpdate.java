package com.example.cursorsync.model;

/**
 * One user's cursor position at a point in time, expressed as a PERCENTAGE
 * of the viewport (0-100) rather than raw pixels. That way two users with
 * different screen sizes/window sizes still see cursors in a sensible
 * relative position.
 */
public class CursorUpdate {

    private String userId;   // stable id generated client-side per session
    private String name;     // display label, e.g. "Guest-42"
    private String color;    // hex color for this user's cursor
    private double x;        // 0-100
    private double y;        // 0-100
    private boolean leaving; // true when the client is disconnecting cleanly

    public CursorUpdate() {
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public boolean isLeaving() {
        return leaving;
    }

    public void setLeaving(boolean leaving) {
        this.leaving = leaving;
    }
}
