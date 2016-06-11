<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * User
 *
 * @ORM\Table(name="user_items")
 * @ORM\Entity(repositoryClass="NTR1X\LayoutBundle\Repository\UserRepository")
 */
class User
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
    private $email;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", nullable=false)
     */
    private $pwdhash;

    /**
     * @var string
     *
     * @ORM\Column(name="salt", type="string", nullable=false)
     */
    private $salt;

    /**
     * @ORM\OneToMany(targetEntity="Domain", mappedBy="user", orphanRemoval=true, cascade={"persist", "remove"})
     */
    private $domain;

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
     * Set email
     *
     * @param string $email
     *
     * @return User
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
     * Set pwdhash
     *
     * @param string $pwdhash
     *
     * @return User
     */
    public function setPwdhash($pwdhash)
    {
        $this->pwdhash = $pwdhash;

        return $this;
    }

    /**
     * Get pwdhash
     *
     * @return string
     */
    public function getPwdhash()
    {
        return $this->pwdhash;
    }

    /**
     * Set salt
     *
     * @param string $salt
     *
     * @return User
     */
    public function setSalt($salt)
    {
        $this->salt = $salt;

        return $this;
    }

    /**
     * Get salt
     *
     * @return string
     */
    public function getSalt()
    {
        return $this->salt;
    }

    /**
     * Add domain
     *
     * @param \NTR1X\LayoutBundle\Entity\Domain $domain
     *
     * @return User
     */
    public function addDomain(\NTR1X\LayoutBundle\Entity\Domain $domain)
    {
        $this->domain[] = $domain;

        return $this;
    }

    /**
     * Remove domain
     *
     * @param \NTR1X\LayoutBundle\Entity\Domain $domain
     */
    public function removeDomain(\NTR1X\LayoutBundle\Entity\Domain $domain)
    {
        $this->domain->removeElement($domain);
    }

    /**
     * Get domain
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getDomain()
    {
        return $this->domain;
    }
}
