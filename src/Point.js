class Point {
    constructor() {
        this.type = 'point';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 10.0;
    }
    render() {
        
        gl.disableVertexAttribArray(a_Position);
        
        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        // Pass size
        gl.uniform1f(u_Size, this.size);
        // Draw
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}
