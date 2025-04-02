<?php
class Product {
    public $id, $name, $description, $price, $image, $rating;

    public function __construct($id, $name, $description, $price, $image, $rating) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->image = $image;
        $this->rating = $rating;
    }
}
?>
