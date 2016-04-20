<?php

namespace NTR1X\ApplyBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

use NTR1X\UploadBundle\Entity\Upload;
use NTR1X\SearchBundle\Entity\Search;

/**
 * Apply
 *
 * @ORM\Table(name="apply_items")
 * @ORM\Entity(repositoryClass="NTR1X\ApplyBundle\Repository\ApplyRepository")
 */
class Apply
{
	/**
	 * @var int
	 *
	 * @ORM\Column(name="id", type="integer")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * @ORM\ManyToOne(targetEntity="Category", inversedBy="items")
	 * @ORM\JoinColumn(name="category_id", referencedColumnName="id", nullable=false)
	 */
	private $category;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="applicant", type="string", length=511)
	 */
	private $applicant;

    /**
     * @var string
     *
     * @ORM\Column(name="email", type="string", length=511)
     */
    private $email;

    /**
     * @var string
     *
     * @ORM\Column(name="phone", type="string", length=511)
     */
    private $phone;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="subject", type="string", length=511)
	 */
	private $subject;

	/**
	 * @var string
	 *
	 * @ORM\Column(name="message", type="text")
	 */
	private $message;

	/**
	 * @var \DateTime
	 *
	 * @ORM\Column(name="published", type="date")
	 */
	private $published;

	public function __construct() {
	}

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
     * Set applicant
     *
     * @param string $applicant
     *
     * @return Apply
     */
    public function setApplicant($applicant)
    {
        $this->applicant = $applicant;

        return $this;
    }

    /**
     * Get applicant
     *
     * @return string
     */
    public function getApplicant()
    {
        return $this->applicant;
    }

    /**
     * Set subject
     *
     * @param string $subject
     *
     * @return Apply
     */
    public function setSubject($subject)
    {
        $this->subject = $subject;

        return $this;
    }

    /**
     * Get subject
     *
     * @return string
     */
    public function getSubject()
    {
        return $this->subject;
    }

    /**
     * Set description
     *
     * @param string $description
     *
     * @return Apply
     */
    public function setDescription($description)
    {
        $this->description = $description;

        return $this;
    }

    /**
     * Get description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set published
     *
     * @param \DateTime $published
     *
     * @return Apply
     */
    public function setPublished($published)
    {
        $this->published = $published;

        return $this;
    }

    /**
     * Get published
     *
     * @return \DateTime
     */
    public function getPublished()
    {
        return $this->published;
    }

    /**
     * Set category
     *
     * @param \NTR1X\ApplyBundle\Entity\Category $category
     *
     * @return Apply
     */
    public function setCategory(\NTR1X\ApplyBundle\Entity\Category $category)
    {
        $this->category = $category;

        return $this;
    }

    /**
     * Get category
     *
     * @return \NTR1X\ApplyBundle\Entity\Category
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * Set message
     *
     * @param string $message
     *
     * @return Apply
     */
    public function setMessage($message)
    {
        $this->message = $message;

        return $this;
    }

    /**
     * Get message
     *
     * @return string
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Set email
     *
     * @param string $email
     *
     * @return Apply
     */
    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    /**
     * Get email
     *
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set phone
     *
     * @param string $phone
     *
     * @return Apply
     */
    public function setPhone($phone)
    {
        $this->phone = $phone;

        return $this;
    }

    /**
     * Get phone
     *
     * @return string
     */
    public function getPhone()
    {
        return $this->phone;
    }
}
