<?php
class Product implements JsonSerializable {
    public $id, $name, $description, $price, $image, $rating;

    public function __construct($id, $name, $description, $price, $image, $rating) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->image = $image;
        $this->rating = $rating;
    }

    // Diese Methode macht die Klasse "json_encode"-fähig
    public function jsonSerialize(): mixed {
        return get_object_vars($this);
    }
}
?>
