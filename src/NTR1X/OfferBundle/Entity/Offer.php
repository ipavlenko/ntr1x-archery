<?php

namespace NTR1X\OfferBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

use NTR1X\UploadBundle\Entity\Upload;

/**
 * Offer
 *
 * @ORM\Table(name="offer_items")
 * @ORM\Entity(repositoryClass="NTR1X\OfferBundle\Repository\OfferRepository")
 */
class Offer {
	/**
	 * @var int
	 *
	 * @ORM\Column(name="id", type="integer")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="url", type="string", length=511)
     */
    private $url;

	/**
     * @ORM\ManyToOne(targetEntity="Category", inversedBy="items")
     * @ORM\JoinColumn(name="category_id", referencedColumnName="id", nullable=false)
     */
    private $category;

    /**
     * @var \NTR1X\UploadBundle\Entity\Upload
     * 
     * @ORM\OneToOne(targetEntity="\NTR1X\UploadBundle\Entity\Upload", orphanRemoval=true, fetch="EAGER", cascade={"persist", "remove"})
     * @ORM\JoinColumn(name="image_id", referencedColumnName="id")
     */
    private $image;

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set category
     *
     * @param \NTR1X\OfferBundle\Entity\Category $category
     *
     * @return Offer
     */
    public function setCategory(\NTR1X\OfferBundle\Entity\Category $category)
    {
        $this->category = $category;

        return $this;
    }

    /**
     * Get category
     *
     * @return \NTR1X\OfferBundle\Entity\Category
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * Set url
     *
     * @param string $url
     *
     * @return Offer
     */
    public function setUrl($url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * Get url
     *
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * Set image
     *
     * @param \NTR1X\UploadBundle\Entity\Upload $image
     *
     * @return Media
     */
    public function setImage(\NTR1X\UploadBundle\Entity\Upload $image = null)
    {
        $this->image = $image;

        return $this;
    }

    /**
     * Get image
     *
     * @return \NTR1X\UploadBundle\Entity\Upload
     */
    public function getImage()
    {
        return $this->image;
    }
}
