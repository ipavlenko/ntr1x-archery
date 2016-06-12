<?php

namespace NTR1X\LayoutBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

use JMS\Serializer\Annotation as JMS;

/**
 * User
 *
 * @ORM\Table(name="user_items")
 * @ORM\Entity(repositoryClass="NTR1X\LayoutBundle\Repository\UserRepository")
 * @JMS\ExclusionPolicy("none")
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
     * @ORM\Column(name="email", type="string", length=255, nullable=false, unique=true)
     */
    private $email;

    /**
     * @var string
     *
     * @ORM\Column(name="pwdhash", type="string", length=255, nullable=false)
     * @JMS\Exclude
     */
    private $pwdhash;

    /**
     * @ORM\OneToMany(targetEntity="Domain", mappedBy="user", fetch="EXTRA_LAZY")
     * @JMS\Exclude
     */
    private $domains;

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
     * Add domain
     *
     * @param \NTR1X\LayoutBundle\Entity\Domain $domain
     *
     * @return User
     */
    public function addDomain(\NTR1X\LayoutBundle\Entity\Domain $domain)
    {
        $this->domains[] = $domain;

        return $this;
    }

    /**
     * Remove domain
     *
     * @param \NTR1X\LayoutBundle\Entity\Domain $domain
     */
    public function removeDomain(\NTR1X\LayoutBundle\Entity\Domain $domain)
    {
        $this->domains->removeElement($domain);
    }

    /**
     * Get domains
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getDomains()
    {
        return $this->domains;
    }
}
