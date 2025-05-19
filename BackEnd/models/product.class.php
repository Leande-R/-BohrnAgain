<?php
class Product {
    private $id, $name, $description, $price, $image, $rating, $category_id;

    public function __construct($id, $name, $description, $price, $image, $rating, $category_id) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->image = $image;
        $this->rating = $rating;
        $this->category_id = $category_id;
    }

    public static function getAll($pdo) {
        $stmt = $pdo->prepare("SELECT * FROM products");
        $stmt->execute();
        $products = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $products[] = new Product(
                $row['id'],
                $row['name'],
                $row['description'],
                $row['price'],
                $row['image'],
                $row['rating'],
                $row['category_id']
            );
        }

        return $products;
    }

    public function toArray() {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'image' => $this->image,
            'rating' => $this->rating,
            'category_id' => $this->category_id
        ];
    }
}
?>
