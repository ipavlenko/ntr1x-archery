<?php

namespace AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Source
 *
 * @ORM\Table(name="schema_items")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\SchemaRepository")
 */
class Schema
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
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=511)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="url", type="string", length=511)
     */
    private $url;

    /**
     * @ORM\OneToOne(targetEntity="Resource", cascade={"persist"}, fetch="EAGER")
     * @ORM\JoinColumn(name="resource_id", referencedColumnName="id", nullable=false)
     */
    private $resource;

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
     * Set name
     *
     * @param string $name
     *
     * @return Schema
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set url
     *
     * @param string $url
     *
     * @return Schema
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
     * Set resource
     *
     * @param \AppBundle\Entity\Resource $resource
     *
     * @return Schema
     */
    public function setResource(\AppBundle\Entity\Resource $resource)
    {
        $this->resource = $resource;

        return $this;
    }

    /**
     * Get resource
     *
     * @return \AppBundle\Entity\Resource
     */
    public function getResource()
    {
        return $this->resource;
    }
}